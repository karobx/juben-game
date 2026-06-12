"""Immersive story graph builder for 中一秦漢 (8 chapters)."""

from __future__ import annotations

from typing import Any

from services.immersive_common import build_immersive_period_graph, reader_spec

# Per-chapter immersive content keyed by chapter title from metadata.json
_CHAPTER_SPECS: dict[str, dict[str, Any]] = {
    "秦朝的統一及其統治措施與影響": reader_spec(
        "秦朝的統一及其統治措施與影響",
        "公元前237年，秦王政採納李斯建議，準備併滅六國。"
        "殿上議論紛紛——統一之後，文字、車軌、度量該不該立刻劃一？",
        first_person_body=(
            "公元前237年，你站在咸陽宮中。"
            "秦王政剛採納李斯建議，準備併滅六國。殿上議論紛紛——"
            "統一之後，文字、車軌、度量該不該立刻劃一？"
        ),
        decision="始皇帝等你獻策——",
        decision_reader="研讀史料後，試想：若你在咸陽殿上，會如何獻策？",
        perspective_era="qin",
        hotspot={
            "id": "clue_lisi_memorial",
            "label": "展閱李斯奏章",
            "clue": {
                "title": "李斯奏章",
                "content": "「書同文、車同軌、統一度量衡，政令方能從咸陽直達天下。」",
                "speaker": "李斯",
            },
        },
        historical={
            "label": "我奏請：當即推行書同文、車同軌、統一度量衡",
            "historyNote": "史書載：秦始皇確實推行書同文、車同軌、統一度量衡。",
            "consequence": "你做出了與始皇帝相同的抉擇，正史繼續向前。",
        },
        divergent_a={
            "label": "我建議暫緩改革，先安撫六國舊臣",
            "historyNote": "秦能速統六國，正在於雷厲風行的制度統一；暫緩改革並無史載。",
        },
        divergent_b={
            "label": "我提議只統一貨幣，文字車軌各郡自定",
            "historyNote": "若各郡仍用舊制，驛站傳令必常誤，「大一統」只剩地圖輪廓。",
        },
        deviation_fp="你看到各郡仍用舊制。驛站傳令常誤，邊吏各行其是——你當初的選擇正把帝国拖向分裂。",
        deviation_reader="你發現各郡仍用舊制，驛站傳令常誤——這與大一統的史實方向不符。",
    ),
    "秦朝滅亡與楚漢相爭": reader_spec(
        "秦朝滅亡與楚漢相爭",
        "秦始皇已於公元前210年崩逝，此後天下動盪。"
        "史書載：長城與阿房宮動員無數民夫，焚書坑儒令天下噤聲；"
        "陳勝、吳廣揭竿，項羽、劉邦逐鹿中原。"
        "你要理解：秦亡，究竟誰之過？",
        first_person_body=(
            "長城與阿房宮動員無數民夫，焚書坑儒令天下噤聲。"
            "陳勝、吳廣揭竿，項羽、劉邦逐鹿中原——你必須說出對秦亡的看法。"
        ),
        decision="同僚轉頭看你：秦亡，究竟誰之過？",
        decision_reader="研讀史料後，你會如何評價秦亡的原因？",
        perspective_era="chu_han",
        hotspot={
            "id": "clue_corvee_notice",
            "label": "查看徭役告示",
            "clue": {
                "title": "徭役告示",
                "content": "「發民夫三十萬修長城，逾期者斬。」民怨早已積累。",
            },
        },
        historical={
            "label": "我說：統一之功不可沒，暴政之過亦不可掩",
            "historyNote": "史學共識：始皇有統一之大功，亦有苛法濫役、焚書坑儒之過。",
            "consequence": "你的分析符合史實，進入楚漢相爭的變局。",
        },
        divergent_a={
            "label": "我認為：秦滅只因胡亥昏庸，與始皇無關",
            "historyNote": "陳勝、吳廣起事時民怨已積；苛法與濫役在始皇時期已耗盡民力。",
        },
        divergent_b={
            "label": "我堅持：始皇功績蓋過一切",
            "historyNote": "只讚功而不論過，無法解釋天下群起而攻之的史實。",
        },
        deviation_fp="你把所有過錯推給二世，卻無視苛法與濫役早已耗盡民力。街市老人搖頭：「暴政早從始皇時便開始了。」",
        deviation_reader="你把秦亡全歸咎於二世，卻忽略了始皇時期苛法與濫役早已耗盡民力。",
    ),
    "西漢的建立": reader_spec(
        "西漢的建立",
        "此時距秦始皇駕崩已逾數十年，秦制餘緒仍在。"
        "史書載：垓下之戰後，劉邦戰勝項羽，在長安稱帝，是為漢高祖。"
        "新朝初立，該用什麼治國之道？",
        first_person_body=(
            "垓下之戰塵埃落定。你戰勝項羽，在長安稱帝，是為漢高祖。"
            "新朝初立，該用什麼治國之道？"
        ),
        decision="漢高祖問你：如何安天下？",
        decision_reader="試想：若你是漢初謀臣，開國該用什麼治國之道？",
        perspective_era="han_west",
        hotspot={
            "id": "clue_three_rules",
            "label": "細讀約法三章",
            "clue": {
                "title": "約法三章",
                "content": "「殺人者死，傷人及盜抵罪，餘悉除去秦法。」",
                "speaker": "劉邦",
            },
        },
        historical={
            "label": "我贊成約法三章，廢除苛法，與民休息",
            "historyNote": "史載：劉邦入關後約法三章，廢除秦苛法，贏得民心。",
            "consequence": "你理解了漢初「與民休息」的開國之道。",
        },
        divergent_a={
            "label": "我建議沿用秦法，以嚴刑維持秩序",
            "historyNote": "劉邦若完全沿用秦法，難以贏得關中民心，漢朝基業恐不穩。",
        },
        divergent_b={
            "label": "我提議分封諸侯，恢復戰國格局",
            "historyNote": "劉邦雖有分封，但中央集權方向已定；完全恢復戰國格局並非史實。",
        },
        deviation_fp="嚴刑與分封之議引發動盪。新朝根基動搖，你必須重新思考開國之道。",
        deviation_reader="嚴刑與分封之議若處理不當，漢初根基將動搖——這與史實開國路線不符。",
    ),
    "漢武帝的文治與武功": reader_spec(
        "漢武帝的文治與武功",
        "休養生息七十餘年後，漢朝國力日盛。"
        "年輕的漢武帝即位，有人主張繼續守成，有人主張開疆拓土、罷黜百家。",
        first_person_body=(
            "休養生息七十餘年後，漢朝國力日盛。"
            "年輕的漢武帝即位，有人主張繼續守成，有人主張開疆拓土、罷黜百家。"
        ),
        decision="漢武帝等你陳述方略——",
        decision_reader="研讀武帝朝史料，你會如何理解文治武功的方向？",
        perspective_era="han_west",
        hotspot={
            "id": "clue_wudi_edict",
            "label": "展閱推恩詔令草案",
            "clue": {
                "title": "推恩之制",
                "content": "「令諸侯推恩，分封子弟為侯，實則削弱藩王。」",
            },
        },
        historical={
            "label": "我支持推恩令、獨尊儒術，並準備對匈奴用兵",
            "historyNote": "漢武帝確實推行推恩令、罷黜百家獨尊儒術，並對匈奴多次用兵。",
            "consequence": "你把握了漢武帝文治武功的方向。",
        },
        divergent_a={
            "label": "我勸陛下繼續休養生息，勿動刀兵",
            "historyNote": "漢武帝時期對外擴張是重要史實；完全守成並非武帝路線。",
        },
        divergent_b={
            "label": "我主張恢復分封，削弱中央",
            "historyNote": "武帝方向是加強中央集權，而非削弱。",
        },
        deviation_fp="你的保守建議與時代潮流背離。藩王坐大、邊患未除——漢朝該往何處去？",
        deviation_reader="完全守成的路線難以解釋武帝朝的擴張與制度改革。",
    ),
    "昭宣以後戚宦政治與漢朝的衰亡": reader_spec(
        "昭宣以後戚宦政治與漢朝的衰亡",
        "漢武帝好大喜功，晚年國力漸衰。"
        "其後外戚與宦官輪流專權，朝政日非——你要理解漢朝衰亡的原因。",
        first_person_body=(
            "漢武帝好大喜功，晚年國力漸衰。"
            "其後外戚與宦官輪流專權，朝政日非——你必須說出漢朝衰亡的原因。"
        ),
        decision="史官問你：漢室何以中衰？",
        decision_reader="研讀漢末史料，你會如何解釋漢室中衰？",
        perspective_era="han_west",
        hotspot={
            "id": "clue_eunuch_power",
            "label": "查閱宮廷記錄",
            "clue": {
                "title": "戚宦專權",
                "content": "「外戚干政、宦官弄權，朝綱紊亂，民不堪命。」",
            },
        },
        historical={
            "label": "我指出：武帝耗竭國力，後來外戚宦官專權加速衰亡",
            "historyNote": "史學認為：武帝晚年已耗國力，後來外戚與宦官政治加劇了漢朝衰亡。",
            "consequence": "你理解了漢朝由盛轉衰的關鍵。",
        },
        divergent_a={
            "label": "我認為漢朝一直國力強盛，從未衰亡",
            "historyNote": "東漢末年黃巾起事、群雄割據，漢室衰亡是明確史實。",
        },
        divergent_b={
            "label": "我把衰亡全歸咎於單一外戚",
            "historyNote": "漢朝衰亡是多重因素，非一人之過。",
        },
        deviation_fp="你對漢末局勢的判斷過於簡化。史實與你的理解漸行漸遠。",
        deviation_reader="把漢室衰亡歸因過於單一，難以解釋東漢末年的多重變局。",
    ),
    "兩漢通西域與中外文化交流": reader_spec(
        "兩漢通西域與中外文化交流",
        "大月氏西遷，匈奴屢犯邊境。"
        "漢朝該閉關自守，還是派使節通西域、聯絡大月氏共擊匈奴？",
        first_person_body=(
            "大月氏西遷，匈奴屢犯邊境。"
            "漢朝該閉關自守，還是派使節通西域、聯絡大月氏共擊匈奴？"
        ),
        decision="朝堂議論通西域之策——",
        decision_reader="研讀絲路史料，你會如何評價通西域的抉擇？",
        perspective_era="han_west",
        hotspot={
            "id": "clue_zhangqian",
            "label": "閱讀張騫出使記",
            "clue": {
                "title": "張騫出使",
                "content": "「鑿空西域，開絲綢之路，促進中外文化交流。」",
                "speaker": "張騫",
            },
        },
        historical={
            "label": "我支持派使節通西域，聯絡大月氏，開闢絲路",
            "historyNote": "史載：漢武帝派張騫出使西域，開闢絲綢之路。",
            "consequence": "你理解了兩漢通西域的歷史意義。",
        },
        divergent_a={
            "label": "我主張閉關自守，斷絕西域交通",
            "historyNote": "兩漢通西域是重要史實，絲路對中外交流影響深遠。",
        },
        divergent_b={
            "label": "我認為絲路純屬傳說，並無史據",
            "historyNote": "張騫出使與絲綢之路有充分文獻與考古證據。",
        },
        deviation_fp="閉關政策使邊境更不安寧。西域諸國與中原隔絕，你錯過了歷史的轉折。",
        deviation_reader="閉關自守難以解釋兩漢通西域與絲路形成的史實。",
    ),
    "道教的形成（延伸）": reader_spec(
        "道教的形成（延伸）",
        "東漢末年社會動盪。"
        "張陵的五斗米道、張角的太平道以符水治病，結合黃老思想傳教——"
        "這與後來的道教有何關係？",
        first_person_body=(
            "東漢末年社會動盪。"
            "張陵的五斗米道、張角的太平道以符水治病，結合黃老思想傳教——"
            "這與後來的道教有何關係？"
        ),
        decision="你該如何理解這股宗教潮流？",
        decision_reader="研讀宗教源流，你會如何把五斗米道、太平道與道教形成連結起來？",
        perspective_era="han_east",
        hotspot={
            "id": "clue_taiping",
            "label": "翻閱太平道經文",
            "clue": {
                "title": "太平道",
                "content": "「以符水咒語治病，結合黃老思想，為道教形成奠定基礎。」",
            },
        },
        historical={
            "label": "我指出：五斗米道與太平道是道教形成的重要源流",
            "historyNote": "史學認為：東漢末五斗米道、太平道等是道教形成的重要源流。",
            "consequence": "你理解了道教與黃老思想的淵源。",
        },
        divergent_a={
            "label": "我認為道教與黃老思想毫無關係",
            "historyNote": "道教形成確實吸收了黃老思想與神仙方術。",
        },
        divergent_b={
            "label": "我把太平道等同於現代道教全貌",
            "historyNote": "太平道是源流之一，道教歷經長期演變才形成。",
        },
        deviation_fp="你對宗教源流的理解有偏差。課本記載的脈絡與你的說法對不上。",
        deviation_reader="你對道教源流的理解與課本記載的脈絡對不上。",
    ),
    "科技發明（延伸）": reader_spec(
        "科技發明（延伸）",
        "古代文字曾刻在龜甲、青銅上，後來在竹帛書寫。"
        "東漢蔡倫改進造紙術，天文儀器也日新月異——這些發明如何改變文明？",
        first_person_body=(
            "古代文字曾刻在龜甲、青銅上，後來在竹帛書寫。"
            "東漢蔡倫改進造紙術，天文儀器也日新月異——這些發明如何改變文明？"
        ),
        decision="最後一問：兩漢科技成就的核心是什麼？",
        decision_reader="研讀科技史，你會如何概括兩漢的重要發明成就？",
        perspective_era="han_east",
        hotspot={
            "id": "clue_paper",
            "label": "觀摩造紙工序",
            "clue": {
                "title": "造紙術",
                "content": "「蔡倫用樹皮、麻頭造紙，成本大降，知識傳播加速。」",
            },
        },
        historical={
            "label": "我指出：造紙術與天文儀器是兩漢重要科技成就",
            "historyNote": "史載：蔡倫改進造紙術；渾天儀等天文儀器在兩漢有重要發展。",
            "consequence": "你完成了秦漢時期的歷史之旅！",
        },
        divergent_a={
            "label": "我認為兩漢沒有任何重要發明",
            "historyNote": "造紙術與天文儀器是公認的兩漢科技成就。",
        },
        divergent_b={
            "label": "我把所有發明都歸功於一人",
            "historyNote": "科技成就是多人、多代積累的結果。",
        },
        deviation_fp="你低估了兩漢科技對後世的影響。還有機會修正理解，完成這段旅程。",
        deviation_reader="否定兩漢科技成就，難以解釋造紙術等對後世的深遠影響。",
    ),
}


def build_immersive_qin_han_graph(meta: dict[str, Any]) -> dict[str, Any]:
    """Build 8-chapter immersive graph with explore hotspots and reveal choices."""
    return build_immersive_period_graph(meta, _CHAPTER_SPECS)
