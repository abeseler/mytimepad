import { html, css } from 'https://cdn.pika.dev/-/lit-element/2.2.1/dist-es2019/lit-element.min.js';
import { stylesSuper } from './styles-super.mjs';
import './time-pad.mjs';

class myTimepad extends stylesSuper {
	static get properties() {
		return {
			snapId: { type: String },
			timepads: { type: Array }
		};
	}

	static get styles() {
		return [super.styles,
		css`
			.tag {background-color:var(--c1);border:1px dotted var(--c1);}
			.tag:hover {border-color:var(--c3);}
		`
		];}

	constructor() {
		super();
		this.snapId = null;
		this.timepads = [];
	}

	render() {
		return html`
			${this.tmplNewPad()}
			<section class="container">
			${this.timepads.map(tp => {
				if (!App.state[tp.id]) {
					App.state[tp.id] = {
						collapsed: true,
						showNotes: false,
						showTimesheet: false,
						showInfoForm: false
					};
				}
				return html`
					<time-pad .id="${tp.id}"></time-pad>
				`
			})}
			</section>
		`;
	}

	firstUpdated() {
		let queryParam = {
			field: 'status',
			op: '==',
			val: 'OPEN'
		}
        this.snapId = App.main.addSnapshot(`users/${App.main.uid}/appData`, this, queryParam);
    }

	updated(changedProp) {
		changedProp.forEach((oldval, name) => {
			App.logPost(`[${this.constructor.name}] ${name} >> ${JSON.stringify(this[name])}`);
		});
	}

	snapListener(snapData) {
		let docs = [];
		snapData.forEach(doc => {
			let timepad = doc.data();
			timepad.id = doc.id;
			docs.push(timepad);
		});
		this.timepads = docs;
	}

	_newPad(timeFlag) {
		let dt = new Date;
		let padData = {
			active: false,
			dateCreated: dt,
			description: '',
			lastModified: dt,
			status: 'OPEN',
			title: '',
			timeEntries: []
		}
		if (timeFlag) { padData.active=true;padData.timeEntries=[dt] }
		firebase.firestore().collection(`users/${App.main.uid}/appData`).add(padData);
	}

	tmplNewPad() {
		return html`
			<section class="section row">
				<div class="half center">
					<div class="large txt-c5 bold cell-row">
						<div class="cell">
							<div class="tag round-large c1 link" @click="${()=>{this._newPad(1)}}">
								<div class="icon txt-c3 xxlarge" style="line-height:1;padding:0px;vertical-align:-8%">note_add</div>
								<div>
									<span>New pad</span>
									<span class="icon large" style="vertical-align:-10%">timer</span>
								</div>
							</div>
						</div>
						<div class="cell">
							<div class="tag round-large c1 link" @click="${()=>{this._newPad(0)}}">
								<div class="icon txt-c3 xxlarge" style="line-height:1;padding:0px;vertical-align:-8%">note_add</div>
								<div>
									<span>New pad</span>
									<span class="icon large" style="vertical-align:-10%">timer_off</span>
								</div>
							</div>
						</div>
					</div>
			</div>
			</section>
		`
	}
}

customElements.define('my-timepad', myTimepad);