import React from 'react';
// import {makeStyles} from '@material-ui/core/styles'
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import CardHeader from "@material-ui/core/CardHeader";
import VolumeUpIcon from '@material-ui/icons/VolumeUp';
import VolumeOffRoundedIcon from '@material-ui/icons/VolumeOffRounded';

const cardInfo = {
    "top": [{
        text: "Top:\n" +
              "The thickness of the vessels’ walls and the clay type were of great\n" +
              "technical importance: apart from preventing leakages, thick walls could\n" +
              "resist the pressure from a gaseous beverage inside. To seal the contents of\n" +
              "the vessels hermetically, their rounded tops would have been covered with\n" +
              "animal skin or something similar, which was tightly fastened around the\n" +
              "narrow neck. The particular shape of the neck is often marked with very\n" +
              "thin grooves, certainly helpful in fastening strings. Owing to the small\n" +
              "orifice, the vessels could only have been filled using a small funnel, and the\n" +
              "liquid would have been poured out in small drops while the vessel was\n" +
              "shaken.",
        footer1: "Date: Twelfth–fourteenth centuries.",
        footer2: "well meaning and kindly."
    }, {
        text: "الرأس:\n" +
              "لسماكة جدران الوعاء ونوع الطين أهميّة تقنيّة كبيرة: بالإضافة إلى منع التسرّب، الجدران السميكة تقاوم\n" +
              "الضغط الذي تسببه السوائل الغازيّة الموجودة بالداخل. لإغلاق محتويات الأوعية جيّدًا، رأس الوعاء يُغطّى\n" +
              "بجلد حيوان أو شيء شبيه، والذي كان يُربَط بإحكام حول عنقه الضيّق. بأغلب الأحيان شكل العنق فيه\n" +
              "أخاديد رفيعة، وهي تساعد على ربط الأشرطة. يمكن ملء الوعاء بالسوائل من خلال الفتحة الصغيرة\n" +
              "بالعنق باستخدام أنبوب صغير، حيث أنّ السائل كان يُسكَب بكميات صغيرة أثناء هزّ الوعاء.",
        footer1: "Date: Twelfth–fourteenth centuries.",
        footer2: "well meaning and kindly."
    },
        {
            text: "העובי של דפנות הכדים וסוג החימר היו בעלי חשיבות טכנית: מעבר למניעת זליגה הנוזל, עובי הדפנות יכל לספוג את הלחץ שנוצר בתוך הכד בגלל הגזים. ובשביל לאטום את תכולת הכדים באופן הרמטי, החלקים העליונים העגולים כוסו, בעזרת עור של בעלי חיים או חומר דומה, שהודק מסביב לצוואר הצר של הכד. חריצים קטנים נחרטו סביב צוואר הכד דבר שתרם רבות לאטימה טובה יותר בעזרת מיתרים ששמו על כיסויי העור.\n"
                  +
                  "הודות לפתח הקטן, את הכדים היה אפשר למלא רק בעזרת משפך קטן כך שטיפות הנוזל נשפכו פנימה בזמן שניערו את הכד.\n",
            footer1: "Date: Twelfth–fourteenth centuries.",
            footer2: "well meaning and kindly."
        }],
    "bottom": [{
        text: "Bottom:\n" +
              "Archaeological excavations at major Muslim and Crusader sites in the\n" +
              "Middle East since the 1930s have recovered numerous spheroid vessels.\n" +
              "Features such as the large variety of types, high quality of production and\n" +
              "attention to detail provoked dispute among researchers as to the true\n" +
              "identity of these vessels. Two schools of thought emerged. One sides with\n" +
              "the ‘Greek fire’ theory, which claims they were used as weapons, and\n" +
              "thereby focuses its research on an attempt to identify the chemical formula\n" +
              "of the contents. The second believes that these vessels simply contained\n" +
              "precious liquids, such as perfume or medicine, or were beer gourds.",
        footer1: "Date: Twelfth–fourteenth centuries.",
        footer2: "well meaning and kindly."
    }, {
        text: "الأسفل:\n" +
              "حفريات أثريّة في مواقع إسلاميّة وصليبيّة رئيسيّة في الشرق الأوسط أعادت إحياء العديد من الأوعية\n" +
              "الكرويّة. بعض المميزات - مثل وجود عدّة أنواع، ودقّة الملاحظة للتفاصيل وجودة الإنتاج العالية دفعت\n" +
              "بالباحثين إلى التشكيك في الهوية الحقيقية لهذه الأوعية. ظهر مذهبان من الأفكار، أحدهما يدعم نظرية النار\n"
              +
              "الإغريقية، فيدّعي أنها كانت تُستعمل كأسلحة، ولهذا يتمحور بحثه حول محاولة تعريف المعادلة الكيميائية\n" +
              "لمحتوياتها. والثاني يؤمن أنّ هذه الأوعية قد احتوت على سوائل ثمينة لا أكثر، مثل الأدوية والعطور، أو قد\n"
              +
              "كانوا كؤوس للمشروب.",
        footer1: "Date: Twelfth–fourteenth centuries.",
        footer2: "well meaning and kindly."
    },
        {
            text: " \n" +
                  "מאז שנות השלושים במאה הקודמת, חפירות ארכיאולוגיות באתרים מוסלמים וצלבנים במזרח התיכון גילו המון כדים כדוריים. סוגים רבים, ייצור ברמה גבוהה ושימת לב לפרטים קטנים גררו ויכוחים בקרב החוקרים לגבי מטרתם האמיתית של הכדים הללו. \n"
                  +
                  "שתי אסכולות שונות נוצרו: חלק מהחוקרים צידדו בתיאוריית ה\"אש היוונית\" כשלטענתם נעשה בה שימוש ככלי נשק ובכך התמקדו בלנסות לזהות באיזה פורמולה כימית השתמשו דאז. חלק אחר מהחוקרים טען שהכדים האלו הכילו נוזלים יקרים, כגון בשמים או תרופות, או השתמשו בהם כמיכלים לבירה.\n",
            footer1: "Date: Twelfth–fourteenth centuries.",
            footer2: "well meaning and kindly."
        }],
    "front": [{
        text: "Front:\n" +
              " \n" +
              "Fragments of thirty sphero-conical vessels (‘Greek fire’ grenades) were discovered during the excavation in and around the Crusader citadel. The vessels are small, typically sphero-conical in shape, with a short neck and a small spout (height c. 12–13 cm, maximum diameter 9–10 cm). Since the walls of the vessels’ bodies are thick (>1 cm), they are relatively heavy for their size. Most are decorated, with incisions, imprinting, relief elements, glazing, painting or stylised Arabic calligraphy. Several have a short inscription mentioning a name or phrase.\n",
        footer1: "Date: Twelfth–fourteenth centuries.",
        footer2: "well meaning and kindly."
    }, {
        text: "\n" +
              "أثناء الحفريات في قلعة للصليبيين، تم اكتشاف شظايا من ثلاثين قنبلة فخاريّة تحتوي مادّة النار الإغريقية، الشظايا صغيرة الحجم، ومعظمها كرويّة مخروطية، لها عنق قصير وثقب قصير (طولها ١٢-١٣ سم، وقطرها من ٩-١٠ سم). تُعتَبَر القنبلة ثقيلة بسبب سماكة جدارها نظرًا لحجمها الصّغير. معظمها مزخرف ومحفور ومنقوش، وكذلك مزيّن بالخطوط العربيّة. ونُقش على بعضهم أسماء أو مصطلحات.\n",
        footer1: "Date: Twelfth–fourteenth centuries.",
        footer2: "well meaning and kindly."
    },
        {
            text: "שברים של שלושים כדים, רימוני יד שנעשו בצורת קונוס עם חלק עליון כדורי שנקראו 'אש יוונית', התגלו בזמן חפירות במצודת הצלבנים. הכדים היו קטנים, לרוב הייתה צורתם כדורית, בעלי \"צוואר\" קצר וזרבובית קטנה (גובה של כ 12 ס\"מ ובעלי קוטר מירבי של בערך 10 ס\"מ). מכיוון שהדפנות של הכדים היו עבות, מעל לסנטימטר, הכדים היו כבדים ביחס לגודלם.\n"
                  +
                  "רוב הכדים קושטו עם חיתוכים, הטבעות, תבליטים, זיגוג, צביעה או קליגרפיה ערבית. על חלק מהכדים אף נחקקו שמות וביטויים.\n",
            footer1: "Date: Twelfth–fourteenth centuries.",
            footer2: "well meaning and kindly."
        }],
    "back": [{
        text: "These vessels are made of dark to brownish-gray, hard-fired clay with molded and carved decoration, consisting of vertical narrow double grooves and scale patterns over the entire body. The neck (c. 3 cm wide) has an opening measuring c. 6 mm in diameter. There is a circumscribed ring at the shoulder. The necks of the vessels end with an orifice 0.4–0.7 cm in diameter, and the bore is conical in shape, similar to the mouth of a modern perfume bottle.",
        footer1: "Date: Twelfth–fourteenth centuries.",
        footer2: "well meaning and kindly."
    }, {
        text: "هذه القنابل مصنوعة من الفخّار المقوّى بالحرارة العالية، وهو داكن يميل لونه إلى الرماديّ البنيّ.\n" +
              "تصنع هذه القنابل من فخار مقولب وم، وتعريضه إلى درجة حرارة عالية،\n" +
              "لصنع هذه القنابل يُسخّن الفخّار في درجة حرارة عالية لتقويته. يكون هذا الفخار منحوت وداكن اللون يميل إلى البنيّ الرّماديّ. مكوّنة من شقوق مدرّجة بشكل عموديّ تغطّيها كلّها. في عنقها والذي قطره ٣ سم يوجد ثقب مخروطيّ الشكل والذي يتراوح قطره من ٧-٦ مم، حيث أنّ قطر فوّهتُهُ هو ٧ مم. والعنق محاط  بنقش دائريّ.\n",
        footer1: "Date: Twelfth–fourteenth centuries.",
        footer2: "well meaning and kindly."
    },
        {
            text: "הכדים הללו עשויים מטין חסין-אש בצבע כהה עד חום-אפור, עם קישוטים חרוטים ויצוקים, המורכבים משני חריצים צרים ואנכיים ותבניות בקנה מידה לאורך גופו של הכד.\n"
                  +
                  "על \"צוואר\" הכד שרוחבו כ-3 ס\"מ יש פתח בקוטר של כ-6 מ\"מ ומתחתיה יש טבעת. צוואר הכד נגמר בפתח שקוטרו נע בין 4-7 מ\"מ והקדח אף הוא בצורה של קונוס בדומה לפתח בקבוק בושם מודרני.\n",
            footer1: "Date: Twelfth–fourteenth centuries.",
            footer2: "well meaning and kindly."
        }]

};

const LOCK_TIME = 3;
const TIMEOUT_DURATION = 3;

const language = {
    ENGLISH: 0,
    ARABIC: 1,
    HEBREW: 2
};

let speech = new SpeechSynthesisUtterance();

class ModelData extends React.Component {
    constructor(props) {
        super(props);
        this.bucketCount = {
            top: 0,
            bottom: 0,
            front: 0,
            back: 0
        };

        this.currentFace = 0;

        this.state = {
            currentFaceState: 0,
            language: 0,
            timeToLock: LOCK_TIME
        };

        this.onFaceChangeTimeout = false;
        this.timeoutCount = 0;
    }

    setLanguage = (lang) => {
        this.setState({language: lang});
    };

    componentWillMount() {
        this.interval = setInterval(() => {
            let newFace = this.props.currentFace;
            let prevFace = this.currentFace;

            if (this.onFaceChangeTimeout) {
                this.timeoutCount++;
                if (this.timeoutCount === TIMEOUT_DURATION * 10) {
                    this.timeoutCount = 0;
                    this.onFaceChangeTimeout = false;
                }
            } else if (newFace && newFace === prevFace) {
                if (this.getInfoByFace(newFace)) {
                    this.bucketCount[this.getInfoByFace(newFace)]++;
                    this.setState(
                        {timeToLock: parseInt((this.bucketCount[this.getInfoByFace(newFace)] / 10 + ""), 10)});
                    if (this.bucketCount[this.getInfoByFace(newFace)] >= LOCK_TIME * 10) {
                        console.log(
                            this.getInfoByFace(newFace) + " " + this.bucketCount[this.getInfoByFace(newFace)]);
                        this.bucketCount = {
                            top: 0,
                            bottom: 0,
                            front: 0,
                            back: 0
                        };

                        this.setState({
                                          currentFaceState: newFace,
                                          timeToLock: LOCK_TIME
                                      }, () => {
                            console.log("stateValue:" + this.state.currentFaceState);
                        });
                        this.onFaceChangeTimeout = true;
                    } else {
                        this.onFaceChangeTimeout = false;
                    }
                } else {
                    this.bucketCount = {
                        top: 0,
                        bottom: 0,
                        front: 0,
                        back: 0
                    };
                }
            }
        }, 100);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps?.currentFace !== this.props?.currentFace) {
            this.currentFace = this.props?.currentFace;
        }
    }

    getInfoByFace = (face) => {
        if (face === 8 || face === 1) {
            return "top";
        } else if (face === 11 || face === 10) {
            return "bottom";
        } else if (face === 6 || face === 3) {
            return "front";
        } else if (face === 5) {
            return "back";
        }
    };

    getLockInfo = (face) => {
        if (face === 8 || face === 1) {
            return "Focus for " + this.state.timeToLock + "/" + LOCK_TIME + " seconds to get top side info";
        } else if (face === 11 || face === 10) {
            return "Focus for " + this.state.timeToLock + "/" + LOCK_TIME + " seconds to get bottom side info";
        } else if (face === 6 || face === 3) {
            return "Focus for " + this.state.timeToLock + "/" + LOCK_TIME + " seconds to get front side info";
        } else if (face === 5) {
            return "Focus for " + this.state.timeToLock + "/" + LOCK_TIME + " seconds to get back side info";
        }
    };

    getCard = (text, footer1, footer2) => {
        return (<CardContent style={{backgroundColor: '#D3D3D3'}}>
            <Typography color="textSecondary" gutterBottom>
                An ancient Incendiary Bottle
            </Typography>
            <Typography variant="h5" component="h2">
                {text}
                <br/>
            </Typography>
            <Typography color="textSecondary">
                {footer1}
            </Typography>
            <Typography variant="body2" component="p">
                {footer2}
                <br/>
                {'"a benevolent smile"'}
            </Typography>
        </CardContent>);
    };

    getCardByCurrentFace = (info, language) => {
        return this.getCard(cardInfo[info][language].text, cardInfo[info][language].footer1,
                            cardInfo[info][language].footer2);
    };

    getCurrentFaceInformation = (face, lang) => {
        if (face === 8 || face === 1) {
            return this.getCardByCurrentFace("top", lang);
        } else if (face === 11 || face === 10) {
            return this.getCardByCurrentFace("bottom", lang);
        } else if (face === 6 || face === 3) {
            return this.getCardByCurrentFace("front", lang);
        } else if (face === 5) {
            return this.getCardByCurrentFace("back", lang);
        }
    };

    render() {
        return (<div>
            <Card>
                <CardHeader title={this.getLockInfo(this.props?.currentFace)}>
                </CardHeader>
                {this.getCurrentFaceInformation(this.state.currentFaceState, this.state.language)}
                <CardActions>
                    <Button fullWidth={true} size="medium"
                            onClick={() => this.setLanguage(language.ENGLISH)}>English</Button>
                    <Button fullWidth={true} size="medium"
                            onClick={() => this.setLanguage(language.HEBREW)}>עברית</Button>
                    <Button fullWidth={true} size="medium"
                            onClick={() => this.setLanguage(language.ARABIC)}>العربية</Button>
                </CardActions>
                <CardActions>
                    <Button fullWidth={true} size="medium" onClick={() => {
                        let textToRead = null;
                        try {
                            console.log(this.getInfoByFace(this.props.currentFace));
                            textToRead = cardInfo[this.getInfoByFace(this.props.currentFace)][this.state.language].text;
                        } catch (e) {
                            console.error(e);
                        }
                        if (textToRead) {
                            window.speechSynthesis.cancel();
                            speech.text = textToRead;
                            speech.lang =
                                this.state.language === 0 ? 'en-US' : this.state.language === 1 ? 'ar-Arabic'
                                                                                                : 'he-Hebrew';
                            window.speechSynthesis.speak(speech);
                        }
                    }}>
                        <VolumeUpIcon fontSize={"large"}></VolumeUpIcon>
                    </Button>
                    <Button fullWidth={true} size="medium" onClick={() => {
                        window.speechSynthesis.cancel();
                    }}>
                        <VolumeOffRoundedIcon fontSize={"large"}></VolumeOffRoundedIcon>
                    </Button>
                </CardActions>
            </Card>
        </div>);
    }
}

export default ModelData;
