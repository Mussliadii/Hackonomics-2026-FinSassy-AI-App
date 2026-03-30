import csv
import io
from datetime import date
from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import Transaction, User
from schemas import TransactionCreate, TransactionResponse, CategoryCorrection, SpendingSummary
from utils.jwt_handler import get_current_user_id
from utils.security import sanitize_input

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=List[TransactionResponse])
async def list_transactions(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    type: Optional[str] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    query = db.query(Transaction).filter(Transaction.user_id == user_id)

    if category:
        query = query.filter(Transaction.category_id == category)
    if type:
        query = query.filter(Transaction.type == type)
    if from_date:
        query = query.filter(Transaction.transaction_date >= from_date)
    if to_date:
        query = query.filter(Transaction.transaction_date <= to_date)

    query = query.order_by(Transaction.transaction_date.desc())
    transactions = query.offset((page - 1) * per_page).limit(per_page).all()
    return transactions


@router.post("", response_model=TransactionResponse)
async def create_transaction(
    req: TransactionCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    if req.type not in ("income", "expense"):
        raise HTTPException(400, "Type must be 'income' or 'expense'")
    if req.amount <= 0:
        raise HTTPException(400, "Amount must be positive")

    transaction = Transaction(
        user_id=user_id,
        raw_text=sanitize_input(req.raw_text),
        amount=int(req.amount),
        currency=user.currency,
        type=req.type,
        transaction_date=req.transaction_date,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # TODO: Call ML service for auto-categorization
    return transaction


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: UUID,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    t = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == user_id,
    ).first()
    if not t:
        raise HTTPException(404, "Transaction not found")
    return t


@router.put("/{transaction_id}/category")
async def correct_category(
    transaction_id: UUID,
    req: CategoryCorrection,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    t = db.query(Transaction).filter(
        Transaction.id == transaction_id,
        Transaction.user_id == user_id,
    ).first()
    if not t:
        raise HTTPException(404, "Transaction not found")

    t.category_id = req.corrected_category_id
    t.is_user_corrected = True
    db.commit()
    return {"message": "Category corrected", "new_category": req.corrected_category_id}


@router.post("/upload")
async def upload_csv(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(400, "Only .csv files are allowed")

    # Limit file size to 5MB
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(400, "File too large. Max 5MB.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    decoded = contents.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    created = 0
    for row in reader:
        try:
            transaction = Transaction(
                user_id=user_id,
                raw_text=sanitize_input(row.get("description", "")),
                amount=int(float(row.get("amount", 0))),
                currency=user.currency,
                type=row.get("type", "expense"),
                transaction_date=date.fromisoformat(row.get("date", str(date.today()))),
            )
            db.add(transaction)
            created += 1
        except (ValueError, KeyError):
            continue

    db.commit()
    return {"message": f"Uploaded {created} transactions", "count": created}


@router.post("/upload-receipt", response_model=TransactionResponse)
async def upload_receipt(
    file: UploadFile = File(...),
    raw_text: str = Query("Receipt purchase"),
    amount: float = Query(...),
    type: str = Query("expense"),
    transaction_date: date = Query(None),
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "Only image files are allowed")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large. Max 10MB.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    import os, uuid as _uuid
    upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "receipts")
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{_uuid.uuid4()}.{ext}"
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb") as f:
        f.write(contents)

    tx_date = transaction_date or date.today()
    transaction = Transaction(
        user_id=user_id,
        raw_text=sanitize_input(raw_text),
        amount=int(amount),
        currency=user.currency,
        type=type if type in ("income", "expense") else "expense",
        transaction_date=tx_date,
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return transaction


@router.get("/summary", response_model=List[SpendingSummary])
async def spending_summary(
    period: str = Query("month"),  # week | month | year
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    # Simple monthly summary by category
    results = (
        db.query(
            Transaction.category_id,
            func.sum(Transaction.amount).label("total_amount"),
            func.count(Transaction.id).label("count"),
        )
        .filter(Transaction.user_id == user_id, Transaction.type == "expense")
        .group_by(Transaction.category_id)
        .all()
    )

    total = sum(r.total_amount or 0 for r in results)
    return [
        SpendingSummary(
            category=r.category_id or "uncategorized",
            total_amount=r.total_amount or 0,
            count=r.count,
            percentage=round((r.total_amount or 0) / total * 100, 1) if total > 0 else 0,
        )
        for r in results
    ]
