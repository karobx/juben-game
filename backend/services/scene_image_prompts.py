"""Derive narrative-aligned image prompts and composition hints for scenes."""

from __future__ import annotations

import re
from typing import Any

from services.nltk_service import build_image_prompt

_PLAYER_PREFIX_RE = re.compile(r"^以\{playerName\}的視角，?")
_READER_PREFIX_RE = re.compile(r"^你翻開課本，(?:來到【[^】]+】。|)")
_MISLEADING_PERIOD_RE = re.compile(r"場景：西域、|西域、咸陽")

_VISUAL_RULES: list[tuple[int, re.Pattern[str], list[str], list[str]]] = [
    (
        1,
        re.compile(r"咸陽宮|殿上|宮中|正殿|廷議|朝堂|奉天殿|朝廷|議論紛紛"),
        ["古風", "歷史繪卷", "朝堂內景"],
        [
            "秦漢宮殿正殿內景，殿上群臣與案几竹簡，室內透視構圖，非鳥瞰外庭",
            "interior Chinese imperial hall, court officials, scrolls on desks, eye-level indoor, not aerial courtyard",
        ],
    ),
    (
        1,
        re.compile(r"長城|民夫|徭役|阿房宮|修築|動員"),
        ["古風", "歷史繪卷", "長城修築"],
        [
            "秦代長城修筑工地，民夫搬運土石與督工，山脊烽火台，勞役場景，非宮殿鳥瞰",
            "Great Wall construction site, laborers and overseers, mountain ridge, corvée labor scene, not palace aerial",
        ],
    ),
    (
        1,
        re.compile(r"焚書|坑儒|禁書"),
        ["古風", "歷史繪卷", "焚書"],
        [
            "秦代焚書場景，官吏焚燒竹簡典籍，煙燼飛揚，街市惶恐，非外庭鳥瞰",
            "Qin book burning, officials burning bamboo scrolls, smoke and ash, tense street scene",
        ],
    ),
    (
        1,
        re.compile(r"長安稱帝|漢高祖|約法三章|新朝初立|入關"),
        ["古風", "歷史繪卷", "西漢開國"],
        [
            "西漢長安宮殿內，劉邦稱帝議政，群臣與約法三章竹簡，開國氛圍，室內透視",
            "Early Han Chang'an palace interior, Liu Bang enthroned, founding court, scrolls, eye-level indoor",
        ],
    ),
    (
        1,
        re.compile(r"張騫|絲路|通西域|西域諸國|大月氏|使節|班超|駱駝商隊"),
        ["古風", "歷史繪卷", "絲路出使"],
        [
            "兩漢絲綢之路，張騫使節與駱駝商隊穿越大漠戈壁，綠洲遠方，非中原宮殿鳥瞰",
            "Silk Road desert, Han envoy Zhang Qian, camel caravan, distant oasis, not palace aerial",
        ],
    ),
    (
        1,
        re.compile(r"外戚|宦官|衰亡|戚宦|朝政日非|輪台|黃巾|國力漸衰"),
        ["古風", "歷史繪卷", "漢室中衰"],
        [
            "東漢末年宮廷內景，外戚宦官專權，昏暗朝堂，吏治紊亂，衰亡氛圍",
            "Late Han court interior, consort kin and eunuch power, dim atmosphere, political decline",
        ],
    ),
    (
        2,
        re.compile(r"揭竿|起義|陳勝|吳廣|逐鹿|項羽|垓下|楚漢|起兵|烏江"),
        ["古風", "歷史繪卷", "揭竿起義"],
        [
            "秦末農民起義與楚漢爭霸場景，義旗招展、兵士列陣，戰場塵煙，非靜謐宮殿",
            "Qin-Han uprising and Chu-Han rivalry, rebel banners, soldiers, battlefield dust, not quiet palace",
        ],
    ),
    (
        2,
        re.compile(r"漢武帝|推恩|獨尊儒術|罷黜百家|董仲舒"),
        ["古風", "歷史繪卷", "武帝朝堂"],
        [
            "漢武帝朝堂內景，儒臣與武將共議，推恩詔與對匈軍報案上，威儀莊重，室內透視",
            "Han Wudi court interior, scholars and generals, edicts and military reports on desks",
        ],
    ),
    (
        1,
        re.compile(r"五斗米|太平道|符水|道教|方士|黃老|祠廟|傳教"),
        ["古風", "歷史繪卷", "道教源流"],
        [
            "東漢鄉間道門儀式，方士以符水治病，信眾圍觀，簡樸祠廟，非皇宮外庭",
            "Eastern Han folk Taoist ritual, fangshi with talisman water, villagers, humble shrine",
        ],
    ),
    (
        1,
        re.compile(r"造紙|蔡倫|渾天儀|天文|竹簡|甲骨|工匠|作坊|觀星"),
        ["古風", "歷史繪卷", "兩漢科技"],
        [
            "兩漢工匠作坊，造紙工序與渾天儀並陳，竹簡與紙張對照，室內工藝場景",
            "Han workshop, papermaking and armillary sphere, bamboo slips beside paper, craft interior",
        ],
    ),
    (
        1,
        re.compile(r"已完成|走完.*章節|親身經歷|大一統帝国|合上課本"),
        ["古風", "歷史繪卷", "史卷回顧"],
        [
            "秦漢歷史長卷回顧，卷軸上秦宮、長城、絲路、科技圖景並列，莊重收束",
            "Qin-Han historical scroll montage, palace wall silk road and inventions on one painted scroll",
        ],
    ),
    (
        1,
        re.compile(r"仰韶|新石器|彩陶|黃河流域|多元一體"),
        ["古風", "歷史繪卷", "史前聚落"],
        [
            "新石器時代仰韶文化聚落，黃土高原河畔，彩陶作坊與農耕人群，考古遺跡氛圍",
            "Neolithic Yangshao village, Yellow River basin, painted pottery, farming settlement, archaeological site",
        ],
    ),
    (
        1,
        re.compile(r"傳疑時代|三皇五帝|神話傳說|口耳相傳"),
        ["古風", "歷史繪卷", "傳疑時代"],
        [
            "上古傳疑時代圖景，黃帝傳說與部落聯盟，朦朧史詩氛圍，非具體朝代宮殿",
            "legendary ancient China, tribal confederations, mythic pre-dynastic atmosphere",
        ],
    ),
    (
        1,
        re.compile(r"夏朝|商朝|周朝|三代|青銅|甲骨文|世襲王朝"),
        ["古風", "歷史繪卷", "夏商周"],
        [
            "夏商周早期國家，青銅禮器與甲骨卜辭，夯土宮室與祭祀場景",
            "Xia Shang Zhou early state, bronze ritual vessels, oracle bones, rammed-earth palace",
        ],
    ),
    (
        1,
        re.compile(r"封建|分封|周武王|宗法|諸侯|采邑"),
        ["古風", "歷史繪卷", "西周封建"],
        [
            "西周封建冊命場景，周天子分封諸侯，宗法族譜與青銅冊命，非後代科舉殿試",
            "Western Zhou enfeoffment ceremony, Zhou king granting fiefs, bronze edicts, feudal order",
        ],
    ),
    (
        1,
        re.compile(r"春秋戰國|兼併戰爭|爭霸|七雄|商鞅|變法"),
        ["古風", "歷史繪卷", "春秋戰國"],
        [
            "春秋戰國兼併戰場，諸侯車戰與城池攻防，戈矛旗幟，動盪裂國氛圍",
            "Spring Autumn Warring States battle, chariots, walled cities, competing kingdoms",
        ],
    ),
    (
        1,
        re.compile(r"三國鼎立|曹操|劉備|孫權|赤壁|諸葛亮|蜀漢|東吳|曹魏|黃巾"),
        ["古風", "歷史繪卷", "三國鼎立"],
        [
            "三國鼎立形勢，魏蜀吳旗幟與江東水寨、北方軍營對峙，戰船與城樓",
            "Three Kingdoms rivalry, Wei Shu Wu banners, river forts and northern camps",
        ],
    ),
    (
        1,
        re.compile(r"兩晉|南北朝|孝文帝|漢化|胡人|鮮卑|北魏|江南開發"),
        ["古風", "歷史繪卷", "南北朝"],
        [
            "南北朝分裂政局，北朝漢化改革與江南水田開發並置，胡漢融合與莊園農耕",
            "Northern and Southern Dynasties, Tuoba sinicization, Jiangnan rice fields",
        ],
    ),
    (
        1,
        re.compile(r"石窟|雲岡|龍門|佛教造像|士族|門閥"),
        ["古風", "歷史繪卷", "石窟士族"],
        [
            "魏晉南北朝石窟佛像與士族清談，洞窟雕刻與竹林風姿，佛教藝術氛圍",
            "Buddhist grotto carvings, aristocratic scholars, Northern Wei stone sculpture",
        ],
    ),
    (
        1,
        re.compile(r"隋朝|隋文帝|開皇|楊堅|統一南北"),
        ["古風", "歷史繪卷", "隋朝統一"],
        [
            "隋朝統一南北，隋文帝朝堂與戰後整編，簡樸嚴整的隋代宮室",
            "Sui dynasty unification, Emperor Wen court, post-war reunification hall",
        ],
    ),
    (
        1,
        re.compile(r"大運河|漕運|洛陽|涿郡|餘杭"),
        ["古風", "歷史繪卷", "隋唐運河"],
        [
            "隋代大運河開鑿，民工疏浚河道，漕船與堤岸驛站，縱貫南北水運",
            "Sui Grand Canal construction, dredging workers, cargo boats along canal",
        ],
    ),
    (
        1,
        re.compile(r"貞觀|唐太宗|李世民|凌煙閣|諫臣"),
        ["古風", "歷史繪卷", "貞觀之治"],
        [
            "唐太宗貞觀朝堂，諫臣奏對與民生恢復，開明君臣共治的唐初宮室內景",
            "Tang Taizong Zhenguan court, remonstrating ministers, early Tang palace interior",
        ],
    ),
    (
        1,
        re.compile(r"武則天|武后|女皇|周代唐"),
        ["古風", "歷史繪卷", "武后施政"],
        [
            "武則天執政朝堂，女帝臨朝與選官改革，莊重唐式宮殿內景",
            "Empress Wu Zetian holding court, Tang dynasty palace interior",
        ],
    ),
    (
        1,
        re.compile(r"安史之亂|安祿山|史思明|潼關|馬嵬坡"),
        ["古風", "歷史繪卷", "安史之亂"],
        [
            "安史之亂戰場，藩鎮叛軍與唐軍交戰，烽火連城，盛世轉衰",
            "An Lushan Rebellion battlefield, Tang troops versus rebel armies, burning cities",
        ],
    ),
    (
        1,
        re.compile(r"玄奘|西行|天竺|取經|中印文化"),
        ["古風", "歷史繪卷", "玄奘西行"],
        [
            "唐代玄奘西行，沙漠與雪山路途，僧侶負經卷，中印文化交流",
            "Tang monk Xuanzang journey west, desert and mountain pilgrimage, Buddhist scriptures",
        ],
    ),
]


def normalize_scene_narrative(narrative: str) -> str:
    text = _PLAYER_PREFIX_RE.sub("", narrative.strip())
    text = _READER_PREFIX_RE.sub("", text)
    return _MISLEADING_PERIOD_RE.sub("", text).strip()


def infer_scene_visual_mood(
    narrative: str,
    *,
    route: str = "mainline",
) -> tuple[list[str], list[str]]:
    """Return mood keywords and bilingual composition hints for image generation."""
    text = normalize_scene_narrative(narrative)
    if route == "deviation":
        return (
            ["暗色調", "戲劇性", "偏離史實"],
            [
                "歷史岔路隱喻，混亂路牌與矛盾詔書，昏暗色調，非宏偉宮殿鳥瞰",
                "forked history metaphor, conflicting edicts and wrong road signs, dim dramatic tone",
            ],
        )

    best: tuple[int, int, list[str], list[str]] | None = None
    for priority, pattern, moods, hints in _VISUAL_RULES:
        match = pattern.search(text)
        if not match:
            continue
        candidate = (priority, match.start(), moods, hints)
        if best is None or candidate[:2] < best[:2]:
            best = candidate

    if best:
        return best[2], best[3]

    return (
        ["古風", "歷史繪卷", "細膩場景"],
        [
            "秦漢時代歷史場景，人物與建築細節，eye-level 敘事構圖，非空曠外庭鳥瞰",
            "Qin-Han historical scene, detailed figures and architecture, narrative eye-level, not empty aerial courtyard",
        ],
    )


def scene_narrative_for_illustration(scene: dict[str, Any]) -> str:
    return (
        scene.get("narrativeAsReader")
        or scene.get("narrative")
        or scene.get("narrativeFirstPerson")
        or ""
    ).strip()


def build_scene_image_prompt(scene: dict[str, Any]) -> dict[str, Any]:
    """Build imagePrompt dict from scene narrative and route."""
    narrative = scene_narrative_for_illustration(scene)
    moods, _ = infer_scene_visual_mood(narrative, route=scene.get("route", "mainline"))
    clean = normalize_scene_narrative(narrative)
    return build_image_prompt(clean, mood_keywords=moods)


def composition_hints_for_narrative(narrative: str, *, route: str = "mainline") -> list[str]:
    _, hints = infer_scene_visual_mood(narrative, route=route)
    return hints
