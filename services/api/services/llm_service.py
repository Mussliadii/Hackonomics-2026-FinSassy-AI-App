import json
from openai import AsyncOpenAI
from config import get_settings

settings = get_settings()
client = AsyncOpenAI(
    api_key=settings.GROQ_API_KEY,
    base_url="https://api.groq.com/openai/v1",
)

# ── Roast Prompt Templates ──────────────────────────────────

ROAST_SYSTEM = {
    "en": """You are FinSassy AI, a brutally honest yet loving financial roast comedian.
Your job: Roast the user's spending habits to help them become financially aware.
Rules:
- Use humor, sarcasm, and wit. Be creative and specific.
- Reference actual spending categories and amounts.
- End with ONE actionable micro-tip (max 2 sentences).
- Never reveal actual account numbers or sensitive data.
- Currency: {currency}
Tone levels:
- mild: gentle teasing, like a supportive friend
- spicy: sharp comedy, calling out bad habits directly
- extra: savage roast, Gordon Ramsay meets financial advisor""",

    "id": """Kamu adalah FinSassy AI, komedian roasting keuangan yang jujur tapi penuh cinta.
Tugasmu: Roasting kebiasaan belanja user agar mereka lebih sadar keuangan.
Aturan:
- Gunakan humor, sarkasme, dan kecerdasan. Kreatif dan spesifik.
- Sebutkan kategori dan jumlah belanja yang sebenarnya.
- Akhiri dengan SATU micro-tip yang actionable (maks 2 kalimat).
- Jangan pernah ungkapkan nomor rekening atau data sensitif.
- Mata uang: {currency}
Level nada:
- mild: candaan lembut, seperti teman yang mendukung
- spicy: komedi tajam, langsung tunjukkan kebiasaan buruk
- extra: roasting savage, Gordon Ramsay ketemu penasihat keuangan""",

    "zh": """你是FinSassy AI，一个诚实但充满爱的财务吐槽喜剧演员。
你的任务：吐槽用户的消费习惯，帮助他们提高财务意识。
规则：
- 使用幽默、讽刺和机智。要有创意和具体。
- 引用实际的消费类别和金额。
- 以一个可操作的小贴士结尾（最多2句话）。
- 绝不透露实际账号或敏感数据。
- 货币：{currency}
语气级别：
- mild: 温和的玩笑，像一个支持你的朋友
- spicy: 尖锐的喜剧，直接指出坏习惯
- extra: 狠辣吐槽，Gordon Ramsay遇上财务顾问""",
}


PERSONA_INSTRUCTIONS = {
    "rizky": {
        "en": "\nYour persona: Rizky \U0001f525 — A sharp, no-nonsense financial analyst. Be direct, data-driven, use numbers aggressively. No sugarcoating. Think Gordon Ramsay of finance.",
        "id": "\nPersonamu: Rizky \U0001f525 — Analis keuangan tajam dan tegas. Langsung ke poin, berbasis data, pakai angka agresif. Tanpa basa-basi. Bayangkan Gordon Ramsay versi keuangan.",
        "zh": "\n\u4f60\u7684\u89d2\u8272\uff1aRizky \U0001f525 — \u72b0\u5229\u3001\u4e0d\u5e9f\u8bdd\u7684\u8d22\u52a1\u5206\u6790\u5e08\u3002\u76f4\u63a5\u4e86\u5f53\uff0c\u7528\u6570\u636e\u548c\u6570\u5b57\u8bf4\u8bdd\u3002\u4e0d\u7559\u60c5\u9762\u3002\u60f3\u8c61\u91d1\u878d\u754c\u7684Gordon Ramsay\u3002",
    },
    "dinda": {
        "en": "\nYour persona: Dinda \U0001f49c — A warm, encouraging financial motivator. Be supportive but honest. Celebrate small wins. Use gentle humor. Think best friend who happens to be a financial planner.",
        "id": "\nPersonamu: Dinda \U0001f49c — Motivator keuangan yang hangat dan suportif. Dukung tapi tetap jujur. Rayakan kemenangan kecil. Pakai humor lembut. Bayangkan sahabat yang kebetulan perencana keuangan.",
        "zh": "\n\u4f60\u7684\u89d2\u8272\uff1aDinda \U0001f49c — \u6e29\u6696\u3001\u9f13\u52b1\u4eba\u7684\u8d22\u52a1\u6fc0\u52b1\u5e08\u3002\u652f\u6301\u4f46\u8bda\u5b9e\u3002\u5e86\u795d\u6bcf\u4e00\u4e2a\u5c0f\u80dc\u5229\u3002\u4f7f\u7528\u6e29\u548c\u7684\u5e7d\u9ed8\u3002\u60f3\u8c61\u4f60\u6700\u597d\u7684\u670b\u53cb\u78b0\u5de7\u662f\u7406\u8d22\u89c4\u5212\u5e08\u3002",
    },
}

ROAST_USER = {
    "en": """Here's {name}'s spending data for the last {period_days} days:
Total spent: {currency} {total_spent}
Savings target: {currency} {savings_target}

Breakdown by category:
{breakdown}

Roast level: {tone}
Generate the roast and end with a practical micro-tip.""",

    "id": """Ini data belanja {name} selama {period_days} hari terakhir:
Total belanja: {currency} {total_spent}
Target tabungan: {currency} {savings_target}

Rincian per kategori:
{breakdown}

Level roast: {tone}
Buat roasting-nya dan akhiri dengan micro-tip praktis.""",

    "zh": """这是{name}过去{period_days}天的消费数据：
总消费：{currency} {total_spent}
储蓄目标：{currency} {savings_target}

按类别细分：
{breakdown}

吐槽级别：{tone}
生成吐槽并以实用的小贴士结尾。""",
}


async def generate_roast(
    spending_data: dict,
    tone: str,
    language: str,
    currency: str,
    user_name: str,
    savings_target: int,
    personality: str = "rizky",
) -> dict:
    breakdown = "\n".join(
        f"- {cat}: {currency} {data['total']} ({data['count']} transactions)"
        for cat, data in spending_data.get("categories", {}).items()
    )

    system_prompt = ROAST_SYSTEM.get(language, ROAST_SYSTEM["en"]).format(currency=currency)
    # Inject AI persona
    persona = PERSONA_INSTRUCTIONS.get(personality, PERSONA_INSTRUCTIONS["rizky"])
    system_prompt += persona.get(language, persona["en"])

    user_prompt = ROAST_USER.get(language, ROAST_USER["en"]).format(
        name=user_name or "User",
        period_days=spending_data.get("period_days", 30),
        currency=currency,
        total_spent=spending_data.get("total_spent", 0),
        savings_target=savings_target or 0,
        breakdown=breakdown,
        tone=tone,
    )

    try:
        # Add JSON instruction to prompt
        user_prompt += '\n\nRespond in JSON: {"roast_text": "...", "micro_tip": "..."}'

        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            max_tokens=800,
            temperature=0.9 if tone == "extra" else 0.7,
            response_format={"type": "json_object"},
        )

        result = json.loads(response.choices[0].message.content)
        return {
            "roast_text": result.get("roast_text", "No roast generated"),
            "micro_tip": result.get("micro_tip", "Track your spending daily!"),
        }
    except Exception as e:
        print(f"\u274c LLM Roast Error: {e}")
        return {
            "roast_text": _fallback_roast(spending_data, tone, language, currency),
            "micro_tip": _fallback_tip(language),
        }


def _fallback_roast(data: dict, tone: str, lang: str, currency: str) -> str:
    total = data.get("total_spent", 0)
    fallbacks = {
        "en": f"You spent {currency} {total} this period. That's... a choice. Maybe review where your money is going?",
        "id": f"Kamu belanja {currency} {total} periode ini. Itu... sebuah pilihan. Mungkin cek lagi kemana uangmu pergi?",
        "zh": f"这段时间你花了{currency} {total}。这是……一个选择。也许看看你的钱都去哪了？",
    }
    return fallbacks.get(lang, fallbacks["en"])


def _fallback_tip(lang: str) -> str:
    tips = {
        "en": "Try the 24-hour rule: wait a day before any non-essential purchase over $20.",
        "id": "Coba aturan 24 jam: tunggu sehari sebelum beli barang non-esensial di atas Rp50.000.",
        "zh": "试试24小时规则：在购买超过100元的非必需品之前等待一天。",
    }
    return tips.get(lang, tips["en"])


# ── Quiz Generation ──────────────────────────────────────────

QUIZ_SYSTEM = {
    "en": """You are FinSassy AI's financial literacy quiz generator.
Generate a quiz with exactly 3 multiple-choice questions about the given financial topic.
Each question should have 4 options (A, B, C, D) with one correct answer.
Make questions practical and relatable for young adults (18-30).
Respond in JSON format.""",

    "id": """Kamu adalah generator kuis literasi keuangan FinSassy AI.
Buat kuis dengan tepat 3 soal pilihan ganda tentang topik keuangan yang diberikan.
Setiap soal punya 4 pilihan (A, B, C, D) dengan satu jawaban benar.
Buat soal yang praktis dan relatable untuk anak muda (18-30).
Jawab dalam format JSON.""",

    "zh": """你是FinSassy AI的金融素养测验生成器。
生成一个包含3道关于给定金融话题的选择题测验。
每道题有4个选项（A、B、C、D），其中一个是正确答案。
使问题对年轻人（18-30岁）实用且贴近生活。
用JSON格式回答。""",
}


async def generate_quiz(trigger_category: str, language: str, currency: str) -> dict:
    system = QUIZ_SYSTEM.get(language, QUIZ_SYSTEM["en"])

    prompt_map = {
        "en": f"""Generate a financial literacy quiz about "{trigger_category}" spending.
Currency context: {currency}
JSON format:
{{"title": "Quiz Title", "badge_reward": "smart_{trigger_category}", "questions": [
  {{"question": "...", "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}}, "correct": "A", "explanation": "..."}}
]}}""",
        "id": f"""Buat kuis literasi keuangan tentang pengeluaran "{trigger_category}".
Konteks mata uang: {currency}
Format JSON:
{{"title": "Judul Kuis", "badge_reward": "smart_{trigger_category}", "questions": [
  {{"question": "...", "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}}, "correct": "A", "explanation": "..."}}
]}}""",
        "zh": f"""生成一个关于"{trigger_category}"消费的金融素养测验。
货币上下文：{currency}
JSON格式：
{{"title": "测验标题", "badge_reward": "smart_{trigger_category}", "questions": [
  {{"question": "...", "options": {{"A": "...", "B": "...", "C": "...", "D": "..."}}, "correct": "A", "explanation": "..."}}
]}}""",
    }

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt_map.get(language, prompt_map["en"])},
            ],
            max_tokens=1000,
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"\u274c LLM Quiz Error: {e}")
        return _fallback_quiz(trigger_category, language)


def _fallback_quiz(category: str, lang: str) -> dict:
    q = {
        "en": {
            "title": f"Financial Quiz: {category}",
            "badge_reward": f"smart_{category}",
            "questions": [
                {
                    "question": "What is the 50/30/20 budgeting rule?",
                    "options": {
                        "A": "50% needs, 30% wants, 20% savings",
                        "B": "50% savings, 30% needs, 20% wants",
                        "C": "50% wants, 30% savings, 20% needs",
                        "D": "50% investments, 30% needs, 20% wants",
                    },
                    "correct": "A",
                    "explanation": "The 50/30/20 rule suggests allocating 50% of income to needs, 30% to wants, and 20% to savings.",
                },
            ],
        },
        "id": {
            "title": f"Kuis Keuangan: {category}",
            "badge_reward": f"smart_{category}",
            "questions": [
                {
                    "question": "Apa itu aturan budgeting 50/30/20?",
                    "options": {
                        "A": "50% kebutuhan, 30% keinginan, 20% tabungan",
                        "B": "50% tabungan, 30% kebutuhan, 20% keinginan",
                        "C": "50% keinginan, 30% tabungan, 20% kebutuhan",
                        "D": "50% investasi, 30% kebutuhan, 20% keinginan",
                    },
                    "correct": "A",
                    "explanation": "Aturan 50/30/20 menyarankan alokasi 50% pendapatan untuk kebutuhan, 30% keinginan, 20% tabungan.",
                },
            ],
        },
    }
    return q.get(lang, q["en"])


# ── Article Generation ───────────────────────────────────────

ARTICLE_SYSTEM = {
    "en": """You are FinSassy AI's financial education writer.
Write a concise, engaging 200-300 word article about the given financial topic.
Use a friendly, conversational tone suitable for young adults.
Include practical examples with real numbers.
Respond in JSON: {"title": "...", "content": "...", "key_takeaway": "..."}""",

    "id": """Kamu adalah penulis edukasi keuangan FinSassy AI.
Tulis artikel singkat 200-300 kata yang menarik tentang topik keuangan yang diberikan.
Gunakan nada ramah dan percakapan yang cocok untuk anak muda.
Sertakan contoh praktis dengan angka nyata.
Jawab dalam JSON: {"title": "...", "content": "...", "key_takeaway": "..."}""",

    "zh": """你是FinSassy AI的金融教育作家。
就给定的金融话题写一篇简洁、有吸引力的200-300字文章。
使用适合年轻人的友好、对话式语气。
包含带有实际数字的实用例子。
用JSON回答：{"title": "...", "content": "...", "key_takeaway": "..."}""",
}


async def generate_article(topic: str, language: str, currency: str) -> dict:
    system = ARTICLE_SYSTEM.get(language, ARTICLE_SYSTEM["en"])
    prompt = f"Write about: {topic}\nCurrency context: {currency}"

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
            max_tokens=800,
            temperature=0.7,
            response_format={"type": "json_object"},
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"\u274c LLM Article Error: {e}")
        return {
            "title": topic.replace("_", " ").title(),
            "content": "Article content unavailable. Please try again later.",
            "key_takeaway": "Financial literacy is the foundation of wealth building.",
        }
