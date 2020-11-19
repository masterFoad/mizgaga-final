import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import {PlayGround} from "./scripts/app/view/PurePlayGround";
import ModelData from "./components/ModelData";

const data = [
    {
        "model": 0,
        "title": "בקבוקי תבערה",
        "information": "כלים עשויים חרס עבה בצבע אפור, עם עיטור חרות בדגם טיפות או קשקשים, שהקנה להם חספוס שהקל על אחיזתם. בראש הכלי נקב קטן, שאליו הוחדר כנראה הפתיל. הבקבוקים האלו, הדומים לרימוני יד, נקראו נפטה (מלשון נפט), וההשערה הרווחת היא ששימשו כבקבוקי תבערה. השימוש בהם החל בתקופה הביזנטית. הצלבנים זיהו אותם עם \"האש היוונית\" – נשק תבערה סודי שהיה עשוי מתערובת דליקה נוזלית של נפטא (נפט גולמי), גופרית, זפת, סיד חי ועוד. התערובת דלקה גם במים (!) לכן שימשה ללוחמה ימית ויבשתית כאחד, והנחילה ניצחונות רבים לצבא הביזנטי. את החומר ניתן היה להתיז בעזרת סיפון, או להשליך ממכלים כמו זה שלפניך.\nישנם חוקרים המזהים בקבוקים אלו כמכלים שנועדו להכיל נוזלים יקרים כמו בושם, שמן קוסמטי או כספית.\n",
        "sensor": "ws://192.168.43.173:81/"
    }
];

ReactDOM.render(
    <React.StrictMode>
        <App/>
    </React.StrictMode>,
    document.getElementById('root')
);

// const pg = new PlayGround('ws://192.168.43.97:81/', {DOM: '3dApp'});
// pg.startMotionTracking();
//
// ReactDOM.render(
//     <ModelData data={data}/>,
//     document.getElementById('reactroot')
// );

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
