
// I prefer JSX
const htmlInlineFuncs = [];
const htmlHandleVal = val => typeof val === 'function' ?
    htmlInlineFuncs.push(val) && `'htmlInlineFuncs[${htmlInlineFuncs.length - 1}]()'` :
    val || '';
const html = (strings, ...values) => Object.assign(
    document.createElement('template'),
    { innerHTML: strings.reduce((acc, val) => acc + htmlHandleVal(values.shift()) + val) }
);

const LISTENERS = Symbol('LISTENERS');
const INPUTS = Symbol('INPUTS');

let focusElm = null;
document.addEventListener('focuswithin', () => console.log('focus'))

const questions = [
    {
        'name': 'Welcome',
        'html': html`
            <h2>Welcome to <a href='https://tonystr.net' target='_blank'>TonyStr</a>'s stepper!</h2>
            <p>
                Hi! I'm Tony, a gamedev/webdev. That's probably good enough for introductions. I wanna warn you, the code behind this website is that of a madman, and sadly as a result, it doesn't work very well in Chrome (or most browsers for that matter). I made it <i>work</i>, but it works better in Firefox. Anyway, you may find some of my approaches interesting, but a part of me just wants to riot through code when I'm not allowed to use React for my webdev :). 
            </p>
            <div class="side-by-side">
                <div>
                    <div>Aim for around 2 hours of working time</div>
                    <div>"around" means a bit over is ok, right? (~3 hrs)</div>
                </div>
                <div>
                    <div>No libraries, vanilla JS only!</div>
                    <div>😒 Fine.</div>
                </div>
                <div>
                    <div>Horizontal or vertical is great</div>
                    <div>great * great = very great, right?</div>
                </div>
                <div>
                    <div>Minimum of 3 steps</div>
                    <div>Check</div>
                </div>
                <div>
                    <div>Make it look nice if you have time</div>
                    <div>I realized too late SCSS wasn't disallowed :(</div>
                </div>
            </div>
        `,
        'fields': {},
    },{
        'name': 'Name details',
        'html': html`
            <h2>Please input your first name and surname</h2>
            <input placeholder="First name" type="text" id="firstname">
            <input placeholder="Surname" type="text" id="surname">
        `,
        'fields': {
            '#firstname': null,
            '#surname': null,
        },
    },{
        'name': 'Pizza toppings',
        'html': html`
            <h2>What are the BEST pizza toppings?</h2>
            <ul>
                <li> Cheese             <input type="checkbox" id="cheese"> </li>
                <li> Greek salad        <input type="checkbox" id="grksalad"> </li>
                <li> Shrimps            <input type="checkbox" id="shrimps" checked> </li>
                <li> Pineapple          <input type="checkbox" id="pineapple" checked disabled readonly> </li>
                <li> Meat               <input type="checkbox" id="meat"> </li>
                <li> Fermented porridge <input type="checkbox" id="uhh"> </li>
            </ul>
        `,
        'fields': {
            'cheese': '',
            'grksalad': '',
            'shrimps': '',
            'pineapple': 'checked',
            'meat': '',
            'uhh': '',
        },
    },{
        'name': 'Rate my app',
        'html': html`
            <h2>Thanks for trying my app!</h2>
            <p> Please rate it: </p>
            Very good <input type="range" min="1" max="100" value="50" id="rating"> Absolutely amazing
        `,
        'fields': { '#rating': null, },
    },{
        'name': 'Cat pics',
        'html': html`
            <h1>GOOD JOB</h1>
            <p>As a reward for completing the <b>tough forms</b> challenge, you get to look at some cat pics</p>
            <img src='catow.jpg' alt='Cat blocking Overwatch'>
            <img src='monocat.gif' alt='Monocat bongo'>
            <img src='catt.jpg' alt='Catt'>
        `,
        'fields': { },
    },
];

const hlClass = ['previous', 'current', 'future'];
let questionHighlight = 0;

function render() {
    const question = questions[questionHighlight];

    document.body.innerHTML = html`
        <div class="page">
            <div class='steps'>
                <div class='step'></div>
                ${questions.slice().reverse().map((quest, i) => html`
                    <div
                        class='question step ${hlClass[1 + Math.sign(questions.length - 1 - i - questionHighlight)]}'
                        style='margin-left: ${(1 - i / (questions.length - 1)) * 100 * (1 - 1 / questions.length)}%'
                        onClick=${questions.length - 1 - i < questionHighlight && (() => {
                            questionHighlight = questions.length - 1 - i;
                            window.requestAnimationFrame(render);
                        })}
                    >
                        ${quest.name}
                    </div>
                `).reduce((acc, val) => acc + val.innerHTML, '')}
            </div>
            <div class="form">
                ${question.html.innerHTML}
                <div class="progress">
                    <div
                        ${questionHighlight <= 0 ? 'style="display: none"' : ''}
                        onClick=${() => {
                            questionHighlight--;
                            window.requestAnimationFrame(render);
                        }}
                    >
                        ❮ Previous
                    </div>
                    <div
                        ${questionHighlight >= questions.length - 1 || Object.values(question.fields).includes(null) ? 'style="display: none"' : ''}
                        onClick=${() => {
                            questionHighlight++;
                            console.log(Object.values(question.fields).includes(null));
                            window.requestAnimationFrame(render);
                        }}
                    >
                        Next ❯
                    </div>
                </div>
            </div>
        </div>
    `.innerHTML;

    if (!question[LISTENERS]) {
        question[LISTENERS] = [];
        for (const field in question.fields) {
            const listener = e => {
                question.fields[field] = e.target.value;
                window.requestAnimationFrame(render);
            };
            question[LISTENERS].push(listener);
            const elm = document.querySelector(field);
            elm.addEventListener('input', listener);
            elm.addEventListener('focus', e => focusElm = e.target);
            // elm.addEventListener('blur', e => { if (focusElm === e.target) focusElm = null });
        }
    }

    if (question[INPUTS]) {
        for (const [field, input] of question[INPUTS]) {
            const elm = document.querySelector(field);
            console.log(elm, input);
            elm.parentNode.insertBefore(input, elm);
            elm.parentNode.removeChild(elm);
            if (focusElm === input) input.focus();
        }
    } else {
        question[INPUTS] = [];
        for (const field in question.fields) {
            question[INPUTS].push([field, document.querySelector(field)]);
        }
    }
}

document.addEventListener('DOMContentLoaded', render);
