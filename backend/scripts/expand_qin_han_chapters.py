#!/usr/bin/env python3
"""Expand qin_han.json scenes 2-8 with 史探模式 hotspots (idempotent)."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

FIXTURE = ROOT / "fixtures" / "f1" / "qin_han.json"

SECRET_CHOICE_LABELS = {
    2: "我請求史官將秦亡評論完整留檔，功過並論以傳後世",
    3: "我請求將約法三章與開國方略交付太史令存檔",
    4: "我請求將推恩與對外用兵之議完整留檔",
    5: "我請求史官記錄漢室衰亡的多重原因，勿歸一人",
    6: "我請求將通西域的見聞編入邊務檔案以傳後世",
    7: "我請求將五斗米道與太平道的源流記入宗教檔",
    8: "我請求將造紙與天文成就編入科技檔以傳後世",
}

SECRET_REVEALS = {
    2: ("太史令掌綜合評述，功過並論方能解釋秦之興亡。", "你獲得太史令記錄，第二章圖鑑接近完卷。"),
    3: ("太史令記錄開國方略，使後世知漢初何以安天下。", "你獲得太史令記錄，第三章圖鑑接近完卷。"),
    4: ("太史令存檔武帝文治武功，為後世理解漢室擴張留據。", "你獲得太史令記錄，第四章圖鑑接近完卷。"),
    5: ("史官記錄衰亡多重因素，避免簡化歷史解釋。", "你獲得史官記錄，第五章圖鑑接近完卷。"),
    6: ("邊務檔案記錄通西域始末，絲路由此載入正史。", "你獲得邊務檔案，第六章圖鑑接近完卷。"),
    7: ("宗教檔記錄道教源流，黃老與方術的結合由此可考。", "你獲得宗教檔，第七章圖鑑接近完卷。"),
    8: ("科技檔記錄兩漢發明，紙與星象改變文明進程。", "你獲得科技檔，第八章圖鑑接近完卷。"),
}

CHAPTERS = {
    2: {
        "first_clue": "scene_2_clue_corvee_notice",
        "hotspots": [
            {
                "id": "scene_2_clue_corvee_notice",
                "label": "查看徭役告示",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "徭役告示",
                    "content": "「發民夫三十萬修長城，逾期者斬。」民怨早已積累。",
                },
            },
            {
                "id": "scene_2_clue_fen_shu",
                "label": "查閱焚書令",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "焚書令",
                    "content": "「非秦記皆燒；詩、書百家語者黜。」思想控制與民怨並行。",
                },
            },
            {
                "id": "scene_2_clue_chensheng",
                "label": "聽聞陳勝起事",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "陳勝吳廣",
                    "content": "「王侯將相寧有種乎！」大澤鄉起事，天下響應。",
                    "speaker": "傳令兵",
                },
            },
            {
                "id": "scene_2_clue_xiangyu",
                "label": "閱讀項羽戰報",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "項羽破秦",
                    "content": "巨鹿之戰後，秦軍主力瓦解。楚漢相爭的棋局已開。",
                },
            },
            {
                "id": "scene_2_clue_secret_memorial",
                "label": "發現史官密記",
                "x": 0,
                "y": 0,
                "hidden": True,
                "requiresClueIds": ["scene_2_clue_corvee_notice"],
                "clue": {
                    "title": "史官密記",
                    "content": "密記云：「始皇之過在於急政，非僅二世之失。」",
                    "speaker": "史官",
                },
            },
            {
                "id": "scene_2_replay_market",
                "label": "重訪 · 街市流言",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "街市流言",
                    "content": "再訪時才聽到：民夫談論阿房宮與長城，怨聲在始皇時已起。",
                },
            },
            {
                "id": "scene_2_replay_books",
                "label": "重訪 · 禁書殘頁",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "禁書殘頁",
                    "content": "第二次探索才在灰燼中發現未燒盡的詩書殘頁——焚書之禍的證物。",
                },
            },
        ],
        "deviation_hotspots": [
            {
                "id": "deviation_2_clue_blame_er_shi",
                "label": "閱讀歸咎二世檔",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "歸咎二世",
                    "content": "檔案只列二世過失，卻未載始皇苛法與濫役——解釋不完整。",
                },
            },
            {
                "id": "deviation_2_clue_praise_only",
                "label": "查看頌功碑文",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "頌功碑文",
                    "content": "碑文只頌統一之功，對民怨隻字不提——無法解釋天下群起。",
                },
            },
        ],
    },
    3: {
        "first_clue": "scene_3_clue_three_rules",
        "hotspots": [
            {
                "id": "scene_3_clue_three_rules",
                "label": "細讀約法三章",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "約法三章",
                    "content": "「殺人者死，傷人及盜抵罪，餘悉除去秦法。」",
                    "speaker": "劉邦",
                },
            },
            {
                "id": "scene_3_clue_chu_han",
                "label": "查看楚漢戰圖",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "楚漢戰圖",
                    "content": "垓下之戰後，項羽自刎烏江，劉邦統一天下。",
                },
            },
            {
                "id": "scene_3_clue_chang_an",
                "label": "巡視長安城坊",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "長安初建",
                    "content": "新都在關中，取「長久安寧」之意，為漢室定都。",
                },
            },
            {
                "id": "scene_3_clue_rest_policy",
                "label": "閱讀休養詔令",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "休養詔令",
                    "content": "「減徭役、放歸農桑。」戰後與民休息，恢復生產。",
                },
            },
            {
                "id": "scene_3_clue_secret_oath",
                "label": "發現入關密誓",
                "x": 0,
                "y": 0,
                "hidden": True,
                "requiresClueIds": ["scene_3_clue_three_rules"],
                "clue": {
                    "title": "入關密誓",
                    "content": "密誓：「先入關者王之，約法三章以安民心。」",
                    "speaker": "劉邦",
                },
            },
            {
                "id": "scene_3_replay_gaixia",
                "label": "重訪 · 垓下舊聞",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "垓下舊聞",
                    "content": "重玩時老卒補述：項羽雖勇，失民心者終失天下。",
                    "speaker": "老卒",
                },
            },
            {
                "id": "scene_3_replay_commoners",
                "label": "重訪 · 關中民戶",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "關中民戶",
                    "content": "第二次才聽到農戶說：約法三章後，才敢開倉放糧。",
                },
            },
        ],
        "deviation_hotspots": [
            {
                "id": "deviation_3_clue_harsh_law",
                "label": "查看秦法舊制",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "秦法舊制",
                    "content": "沿用連坐與重刑，關中百姓惶恐，與開國安民背道。",
                },
            },
            {
                "id": "deviation_3_clue_feudal_chaos",
                "label": "閱讀分封爭議",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "分封爭議",
                    "content": "恢復戰國分封將引發諸侯再爭，漢室基業難穩。",
                },
            },
        ],
    },
    4: {
        "first_clue": "scene_4_clue_wudi_edict",
        "hotspots": [
            {
                "id": "scene_4_clue_wudi_edict",
                "label": "展閱推恩詔令草案",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "推恩之制",
                    "content": "「令諸侯推恩，分封子弟為侯，實則削弱藩王。」",
                },
            },
            {
                "id": "scene_4_clue_ru_jia",
                "label": "閱讀獨尊儒術詔",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "獨尊儒術",
                    "content": "「罷黜百家，獨尊儒術。」為統治確立意識形態基礎。",
                    "speaker": "董仲舒",
                },
            },
            {
                "id": "scene_4_clue_xiongnu",
                "label": "查看對匈軍報",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "對匈用兵",
                    "content": "衛青、霍去病屢破匈奴，開拓邊疆，但也耗費國力。",
                },
            },
            {
                "id": "scene_4_clue_silk_road",
                "label": "調閱通西域檔",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "通西域",
                    "content": "張騫出使後，西域諸國與漢朝往來漸繁。",
                },
            },
            {
                "id": "scene_4_clue_secret_edict",
                "label": "發現密詔補遺",
                "x": 0,
                "y": 0,
                "hidden": True,
                "requiresClueIds": ["scene_4_clue_wudi_edict"],
                "clue": {
                    "title": "密詔補遺",
                    "content": "密詔：推恩與削藩並行，不可偏廢。",
                },
            },
            {
                "id": "scene_4_replay_palace",
                "label": "重訪 · 建章宮議",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "建章宮議",
                    "content": "重玩時才聽到朝臣爭論：文治武功須並重。",
                },
            },
            {
                "id": "scene_4_replay_border",
                "label": "重訪 · 邊關烽火",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "邊關烽火",
                    "content": "第二次才見邊報：匈奴雖退，糧草消耗驚人。",
                },
            },
        ],
        "deviation_hotspots": [
            {
                "id": "deviation_4_clue_peace_only",
                "label": "閱讀守成奏章",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "守成奏章",
                    "content": "只倡休養生息、不事邊功，與武帝時代擴張史實背離。",
                },
            },
            {
                "id": "deviation_4_clue_weak_center",
                "label": "查看分封舊議",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "分封舊議",
                    "content": "削弱中央、恢復分封，將重蹈諸侯之亂。",
                },
            },
        ],
    },
    5: {
        "first_clue": "scene_5_clue_eunuch_power",
        "hotspots": [
            {
                "id": "scene_5_clue_eunuch_power",
                "label": "查閱宮廷記錄",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "戚宦專權",
                    "content": "「外戚干政、宦官弄權，朝綱紊亂，民不堪命。」",
                },
            },
            {
                "id": "scene_5_clue_wudi_late",
                "label": "閱讀武帝晚年詔",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "武帝晚年",
                    "content": "輪台詔悔過，停止部分對外征伐，但國力已耗。",
                },
            },
            {
                "id": "scene_5_clue_yellow_turban",
                "label": "聽聞黃巾流言",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "黃巾前兆",
                    "content": "「蒼天已死，黃天當立。」民間動盪，預示漢室危機。",
                },
            },
            {
                "id": "scene_5_clue_tax_unrest",
                "label": "查看賦稅檔案",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "賦稅繁重",
                    "content": "地方稅役加重，流民增多，社會矛盾尖銳。",
                },
            },
            {
                "id": "scene_5_clue_secret_memorial",
                "label": "發現史官密奏",
                "x": 0,
                "y": 0,
                "hidden": True,
                "requiresClueIds": ["scene_5_clue_eunuch_power"],
                "clue": {
                    "title": "史官密奏",
                    "content": "密奏：衰亡非一人之過，而在國力消耗與政治腐化並行。",
                    "speaker": "史官",
                },
            },
            {
                "id": "scene_5_replay_court",
                "label": "重訪 · 後宮風波",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "後宮風波",
                    "content": "重玩時才知：外戚與宦官輪替專權，始於昭宣以後。",
                },
            },
            {
                "id": "scene_5_replay_peasant",
                "label": "重訪 · 鄉野訴苦",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "鄉野訴苦",
                    "content": "第二次才聽到農民訴：稅吏比賊還兇。",
                },
            },
        ],
        "deviation_hotspots": [
            {
                "id": "deviation_5_clue_deny_decline",
                "label": "查看頌漢碑文",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "頌漢碑文",
                    "content": "只頌漢室強盛，否認衰亡——與東漢末年史實不符。",
                },
            },
            {
                "id": "deviation_5_clue_single_blame",
                "label": "閱讀歸咎單人檔",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "歸咎單人",
                    "content": "將衰亡全歸於某一外戚，忽略結構性問題。",
                },
            },
        ],
    },
    6: {
        "first_clue": "scene_6_clue_zhangqian",
        "hotspots": [
            {
                "id": "scene_6_clue_zhangqian",
                "label": "閱讀張騫出使記",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "張騫出使",
                    "content": "「鑿空西域，開絲綢之路，促進中外文化交流。」",
                    "speaker": "張騫",
                },
            },
            {
                "id": "scene_6_clue_dayuezhi",
                "label": "查看大月氏情報",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "大月氏",
                    "content": "大月氏西遷後，漢朝欲聯絡其共擊匈奴。",
                },
            },
            {
                "id": "scene_6_clue_silk_goods",
                "label": "檢視絲綢貨物",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "絲綢西傳",
                    "content": "長安絲綢經西域遠銷，換回良馬與寶石。",
                },
            },
            {
                "id": "scene_6_clue_ban_chao",
                "label": "閱讀班超事略",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "班超通西域",
                    "content": "「不入虎穴，焉得虎子。」班超以外交與軍事穩定西域。",
                    "speaker": "班超",
                },
            },
            {
                "id": "scene_6_clue_secret_map",
                "label": "發現西域密圖",
                "x": 0,
                "y": 0,
                "hidden": True,
                "requiresClueIds": ["scene_6_clue_zhangqian"],
                "clue": {
                    "title": "西域密圖",
                    "content": "密圖標注未公開的绿洲與商道——出使路线的珍贵记录。",
                },
            },
            {
                "id": "scene_6_replay_camel",
                "label": "重訪 · 駝隊歇腳",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "駝隊歇腳",
                    "content": "重玩時才見胡商以漢語議價——交流已深入日常。",
                },
            },
            {
                "id": "scene_6_replay_envoy",
                "label": "重訪 · 使節舊檔",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "使節舊檔",
                    "content": "第二次才發現：張騫兩次出使，歷時十餘年。",
                },
            },
        ],
        "deviation_hotspots": [
            {
                "id": "deviation_6_clue_closed_border",
                "label": "查看閉關令",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "閉關令",
                    "content": "斷絕西域交通，邊患反而加劇——與史實相反。",
                },
            },
            {
                "id": "deviation_6_clue_deny_silk",
                "label": "閱讀否認絲路檔",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "否認絲路",
                    "content": "稱絲路純屬傳說，無視文獻與考古證據。",
                },
            },
        ],
    },
    7: {
        "first_clue": "scene_7_clue_taiping",
        "hotspots": [
            {
                "id": "scene_7_clue_taiping",
                "label": "翻閱太平道經文",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "太平道",
                    "content": "「以符水咒語治病，結合黃老思想，為道教形成奠定基礎。」",
                },
            },
            {
                "id": "scene_7_clue_wudou",
                "label": "了解五斗米道",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "五斗米道",
                    "content": "張陵創五斗米道，以米五斗為入道信物，在巴蜀傳播。",
                },
            },
            {
                "id": "scene_7_clue_huanglao",
                "label": "研讀黃老殘卷",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "黃老思想",
                    "content": "「無為而治」與神仙方術結合，成為早期道門思想資源。",
                },
            },
            {
                "id": "scene_7_clue_fushui",
                "label": "觀看符水儀式",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "符水治病",
                    "content": "以符咒入水，為民治病，在亂世中吸引大量信眾。",
                },
            },
            {
                "id": "scene_7_clue_secret_scripture",
                "label": "發現密藏經卷",
                "x": 0,
                "y": 0,
                "hidden": True,
                "requiresClueIds": ["scene_7_clue_taiping"],
                "clue": {
                    "title": "密藏經卷",
                    "content": "經卷注：太平道與五斗米道同源異流，皆為道教前身。",
                },
            },
            {
                "id": "scene_7_replay_shrine",
                "label": "重訪 · 鄉間祠廟",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "鄉間祠廟",
                    "content": "重玩時才見村民合祭黃老與地方神——民間信仰混融。",
                },
            },
            {
                "id": "scene_7_replay_healer",
                "label": "重訪 · 方士口述",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "方士口述",
                    "content": "第二次才聽方士說：符水之外，亦傳導引養生之術。",
                    "speaker": "方士",
                },
            },
        ],
        "deviation_hotspots": [
            {
                "id": "deviation_7_clue_deny_huanglao",
                "label": "查看斷絕黃老說",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "斷絕黃老",
                    "content": "認為道教與黃老無關——忽略思想源流。",
                },
            },
            {
                "id": "deviation_7_clue_conflate",
                "label": "閱讀混同教派檔",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "混同教派",
                    "content": "把太平道等同現代道教全貌——忽略長期演變。",
                },
            },
        ],
    },
    8: {
        "first_clue": "scene_8_clue_paper",
        "hotspots": [
            {
                "id": "scene_8_clue_paper",
                "label": "觀摩造紙工序",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "造紙術",
                    "content": "「蔡倫用樹皮、麻頭造紙，成本大降，知識傳播加速。」",
                },
            },
            {
                "id": "scene_8_clue_astrolabe",
                "label": "參觀渾天儀",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "渾天儀",
                    "content": "張衡改進渾天儀，測量天象，反映兩漢天文成就。",
                },
            },
            {
                "id": "scene_8_clue_bamboo",
                "label": "對比竹簡與紙",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "竹帛到紙",
                    "content": "文字載體從甲骨、青銅到竹帛，紙的出現是革命性變化。",
                },
            },
            {
                "id": "scene_8_clue_calendar",
                "label": "查閱太初曆",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "太初曆",
                    "content": "漢朝修訂曆法，指導農時，與天文觀測互為表裡。",
                },
            },
            {
                "id": "scene_8_clue_secret_formula",
                "label": "發現造紙秘方",
                "x": 0,
                "y": 0,
                "hidden": True,
                "requiresClueIds": ["scene_8_clue_paper"],
                "clue": {
                    "title": "造紙秘方",
                    "content": "秘方注：除樹皮麻頭外，亦可加入舊漁網——成本更低。",
                },
            },
            {
                "id": "scene_8_replay_workshop",
                "label": "重訪 · 工匠作坊",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "工匠作坊",
                    "content": "重玩時工匠補述：造紙術非一人之功，歷經多人改進。",
                    "speaker": "工匠",
                },
            },
            {
                "id": "scene_8_replay_stargazer",
                "label": "重訪 · 觀星台",
                "x": 0,
                "y": 0,
                "replayOnly": True,
                "clue": {
                    "title": "觀星台",
                    "content": "第二次夜訪觀星台，才知曆法與農事緊密相連。",
                },
            },
        ],
        "deviation_hotspots": [
            {
                "id": "deviation_8_clue_deny_invention",
                "label": "查看虛無檔案",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "虛無檔案",
                    "content": "否認兩漢重要發明——與科技史公認成就相悖。",
                },
            },
            {
                "id": "deviation_8_clue_one_hero",
                "label": "閱讀獨功檔",
                "x": 0,
                "y": 0,
                "clue": {
                    "title": "獨功檔",
                    "content": "把所有發明歸於一人——忽略多人多代積累。",
                },
            },
        ],
    },
}


def secret_choice(ch: int, next_scene: str) -> dict:
    note, consequence = SECRET_REVEALS[ch]
    return {
        "id": f"scene_{ch}_secret_archive",
        "label": SECRET_CHOICE_LABELS[ch],
        "type": "historical",
        "nextSceneId": next_scene,
        "requiresMinCodexCards": 14,
        "reveal": {
            "verdict": "historical",
            "historyNote": note,
            "consequence": consequence,
        },
    }


def main() -> None:
    data = json.loads(FIXTURE.read_text(encoding="utf-8"))
    scenes = data["storyGraph"]["scenes"]

    next_map = {
        2: "scene_3",
        3: "scene_4",
        4: "scene_5",
        5: "scene_6",
        6: "scene_7",
        7: "scene_8",
        8: "scene_8_end",
    }

    for ch, cfg in CHAPTERS.items():
        scene_key = f"scene_{ch}"
        dev_key = f"deviation_{ch}"
        scene = scenes[scene_key]
        dev = scenes[dev_key]

        scene["requiredClueCount"] = 3
        scene["hotspots"] = cfg["hotspots"]

        choices = scene["choices"]
        # Remove existing secret if re-run
        scene["choices"] = [c for c in choices if not c["id"].endswith("_secret_archive")]
        scene["choices"].append(secret_choice(ch, next_map[ch]))

        dev["requiredClueCount"] = 1
        dev["hotspots"] = cfg["deviation_hotspots"]

    from services.hotspot_layout import apply_hotspot_layout

    apply_hotspot_layout(data["storyGraph"])

    FIXTURE.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Updated {FIXTURE} for chapters 2-8")


if __name__ == "__main__":
    main()
