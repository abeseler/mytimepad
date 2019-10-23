import { html, css } from 'https://cdn.pika.dev/-/lit-element/2.2.1/dist-es2019/lit-element.min.js';
import { stylesSuper } from './styles-super.mjs';

class timePad extends stylesSuper {
	static get properties() {
		return {
			collapsed: { type: Object },
			data: { type: Object },
			desc: { type: String },
			entriesByDate: { type: Array },
			id: { type: String },
			notes: { type: String },
			showNotes: { type: Boolean },
			showTimesheet: { type: Boolean },
			showInfoForm: { type: Boolean },
			snapId: { type: String },
			title: { type: String }
		};
	}

	static get styles() {return [super.styles,
		css`
			header.bar div:not(:first-child) { border-left:1px solid var(--c4) }
			textarea { resize:none;overflow:auto}
			.savebtn:hover { border:1px dotted var(--c5) !important }
			.icon2 { vertical-align:-15% }
			.input { outline:none }
		`
	];}

	constructor() {
		super();
		this.collapsed = App.state[this.id]?App.state[this.id].collapsed:true;
		this.entriesByDate = [];
		this.notes = this.data && this.data.notes?this.data.notes:'';
		this.showNotes = App.state[this.id]?App.state[this.id].showNotes:false;
		this.showTimesheet = App.state[this.id]?App.state[this.id].showTimesheet:false;
		this.showInfoForm = App.state[this.id]?App.state[this.id].showInfoForm:false;
	}

	render() {
		return html`
			${this.data?
				html`
					<div class="section card">
						${this.tmplHeader()}
						${!this.collapsed?
							html`
								${this.tmplMenu()}
								${this.showInfoForm?this.tmplInfoForm():null}
								${this.showNotes?this.tmplNotes():null}
								${this.showTimesheet?this.tmplTimeSheet():null}
							`:null
						}
					</div>
				`:null
			}
		`;
	}

	updated(changedProp) {
		changedProp.forEach((oldval, name) => {
			App.logPost(`[${this.constructor.name}] ${name} >> ${JSON.stringify(this[name])}`);
			if (name == 'id') {
				if (this.snapId) {
					App.main.removeSnapshot(this.snapId);
					this.snapId = null;
				}
				if (this.id) {
					this.snapId = App.main.addSnapshot(`users/${App.main.uid}/appData/${this.id}`, this)
					this.collapsed = true;
					this.showTimesheet = false;
				}
			}
			if (name == 'data') {
				if (App.state[this.id]) {
					this.collapsed = App.state[this.id].collapsed;
					this.showNotes = App.state[this.id].showNotes;
					this.showTimesheet = App.state[this.id].showTimesheet;
					this.showInfoForm = App.state[this.id].showInfoForm;
				}
				this.desc = this.data.description;
				this.notes = this.data.notes;
				this.title = this.data.title;
				this.sortTimeEntries();
			}
		});
	}

	snapListener(snapData) {
		this.data = snapData;
	}

	sortTimeEntries() {
		let tempDates = [];
		let tempStarts = this.data.timeEntries.filter((e,i) => {
			if (++i%2!=0) {
				if (!tempDates.includes(e.toDate().toLocaleDateString())) {
					tempDates.push(e.toDate().toLocaleDateString())
				}
				return true;
			}
		})
		let tempEnds = this.data.timeEntries.filter((e,i)=> {
			if (++i%2==0) return true;
		})
		let pairs = []
		tempStarts.forEach((e,i) => {
			let t = tempEnds[i]?tempEnds[i].toDate():null;
			let d = t?t-e.toDate():0;
			pairs.push({
				start: e.toDate(),
				end: t,
				duration: d
			})
		})
		this.entriesByDate = tempDates.map(d => {
			return {
				dt: d,
				entries: pairs.filter((p) => {
					if (p.start.toLocaleDateString()==d) return true;
				}),
				minutes: () => {
					let tmp = 0;
					pairs.forEach(p => {
						if (p.start.toLocaleDateString()==d) tmp += p.duration;
					})
					return Math.ceil(tmp/60000);
				}
			}
		}).reverse()
	}

	calcTotalTime() {
		let totalTime = 0;
		this.entriesByDate.forEach(entry => {totalTime += entry.minutes()});
		return Math.floor(totalTime/0.6)/100;
	}

	updateState() {
		App.state[this.id] = {
			collapsed: this.collapsed,
			showInfoForm: this.showInfoForm,
			showNotes: this.showNotes,
			showTimesheet: this.showTimesheet
		}
	}

	_playPause() {
		let pActive = this.data.active?false:true;
		let dt = new Date();
		let ptimeEntries = this.data.timeEntries.filter(()=>{return true});
		ptimeEntries.push(dt);
		let pUpdate = {
			active: pActive,
			lastModified: dt,
			timeEntries: ptimeEntries
		}
		firebase.firestore().doc(`users/${App.main.uid}/appData/${this.id}`).update(pUpdate);
	}

	_updateTitleDesc() {
		let dt = new Date();
		let pUpdate = {
			description: this.desc,
			lastModified: dt,
			title: this.title
		}
		firebase.firestore().doc(`users/${App.main.uid}/appData/${this.id}`).update(pUpdate);
	}

	_saveNotes() {
		let dt = new Date();
		let pUpdate = {
			lastModified: dt,
			notes: this.notes
		}
		firebase.firestore().doc(`users/${App.main.uid}/appData/${this.id}`).update(pUpdate);
	}

	_complete() {
		App.main.removeSnapshot(this.snapId);
		let dt = new Date();
		let ptimeEntries = this.data.timeEntries.filter(()=>{return true});
		if (this.data.active) {ptimeEntries.push(dt);}
		let pUpdate = {active:false,lastModified:dt,status:'CLOSED',timeEntries:ptimeEntries}
		firebase.firestore().doc(`users/${App.main.uid}/appData/${this.id}`).update(pUpdate);
	}

	_delete() {
		App.main.removeSnapshot(this.snapId);
		firebase.firestore().doc(`users/${App.main.uid}/appData/${this.id}`).delete();
	}

	tmplHeader() {
		return html`
			<header class="bar topbar border-bottom ${this.data.active?'c4 border-c3':'border-c2'}">
				<div class="bar-item ${this.data.title?null:'border-right'} border-c4 icon hover-c4 link" @click="${this._playPause}">
					${this.data.active?`pause`:`play_arrow`}
				</div>
				${this.data.title?html`<div class="bar-item border-right border-c4 bold title">${this.data.title}</div>`:null}
				${this.data.description?html`<div class="bar-item small border-0 hide-small desc">${this.data.description}</div>`:null}
				<div class="bar-item border-c4 icon hover-c4 right link" @click="${()=>{this.collapsed=this.collapsed?false:true;this.updateState()}}">
					${this.collapsed?`expand_more`:`expand_less`}
				</div>
				<div class="bar-item border-c4 bold right">Today: ${this.data.active?html`<span class="icon icon2 spin" style="line-height:1">rotate_right</span>`:this.entriesByDate.map(entry => {
						let currDate = new Date().toLocaleDateString();
						if (entry.dt == currDate) return Math.floor(entry.minutes()/0.6)/100;
					}
				)}</div>				
				<div class="bar-item border-c4 bold right hide-small">Total: ${this.data.active?
					html`<span class="icon icon2 spin" style="line-height:1">rotate_right</span>`
					:this.calcTotalTime()
				}</div>
			</header>
		`
	}

	tmplMenu() {
		return html`
			<section class="bar small c2">
				<div class="bar-item ${this.showInfoForm?`txt-c1`:null} hover-txt-c4 link" @click="${()=>{this.showInfoForm=this.showInfoForm?false:true;this.updateState()}}">
					<span class="icon icon2">edit</span>
					<span>Info</span>
				</div>
				<div class="bar-item ${this.showNotes?`txt-c1`:null} hover-txt-c4 link" @click="${()=>{this.showNotes=this.showNotes?false:true;this.updateState()}}">
					<span class="icon icon2">note_add</span>
					<span>Notes</span>
				</div>
				<div class="bar-item ${this.showTimesheet?`txt-c1`:null} hover-txt-c4 link" @click="${()=>{this.showTimesheet=this.showTimesheet?false:true;this.updateState()}}">
					<span class="icon icon2">timeline</span>
					<span>Timesheet</span>
				</div>
				<div class="bar-item right hover-txt-c4 link" @click="${this._delete}">
					<span class="icon icon2">delete</span>
					<span>Delete</span>
				</div>
				<div class="bar-item right hover-txt-c4 link" @click="${this._complete}">
					<span class="icon icon2">check_circle</span>
					<span>Complete</span>
				</div>
			</section>
		`
	}

	tmplInfoForm() {
		return html`
			<section class="section">
				${this.title!=this.data.title||this.desc!=this.data.description?html`
					<div class="container section txt-c5 small">
						<span class="round padding-small border border-c1 savebtn link" @click="${this._updateTitleDesc}">
							<span class="icon icon2">save</span>
							<span class="bold">Save Changes</span>
						</span>
					</div>
				`:null}
				<div class="section cell-row small">
					<div class="cell container third">
						<input class="input small border-c4 txt-c5 c1" maxlength="50" type="text" .value="${this.title}" @keyup="${e=>this.title=e.target.value}">
						<label class="txt-c5 bold">Title</label>
					</div>
					<div class="cell container twothird">
						<input class="input small border-c4 txt-c5 c1" maxlength="100" type="text" .value="${this.desc}" @keyup="${e=>this.desc=e.target.value}">
						<label class="txt-c5 bold">Description</label>
					</div>
				</div>
			</section>
			<hr class="border-c4" />
		`
	}

	tmplTimeSheet() {
		return html`
			<ul class="ul border-bottom border-c4">
				<h5 class="container section txt-c3">Total time spent: ${this.calcTotalTime()}</h5>
				${this.entriesByDate.map(d => {
					let today = new Date().toLocaleDateString();
					return html`
						<li>
							<h6 class="row">
								<div class="quarter">${d.dt}</div>
								<div class="third">Hours: ${this.data.active&&d.dt==today?html`<span class="icon spin">rotate_right</span>`:Math.floor(d.minutes()/0.6)/100}</div>
								<div class="rest">Minutes: ${this.data.active&&d.dt==today?html`<span class="icon spin">rotate_right</span>`:d.minutes()}</div>
							</h6>
							<ul class="ul">
								${d.entries.map(entry => {
									return html`
										<li class="row">
											<div class="quarter">${Math.ceil(entry.duration/6000)/10} min</div>
											<div class="third">${entry.start.toLocaleString()}</div>
											<div class="rest mobile">${entry.end?entry.end.toLocaleString():null}</div>
										</li>
									`
								})}
							</ul>
						</li>
					`
				})}
			</ul>
		`
	}

	tmplNotes() {
		return html`
			<section class="section border-bottom border-c4">
				<div class="container section">
					<textarea class="input small border-0 padding-0 c1" placeholder="Enter notes here" rows="20" @keyup="${e=>this.notes=e.target.value}">${this.notes}</textarea>
					${this.notes != this.data.notes
						?html`
							<div class="container margin-top txt-c5 small">
								<span class="round padding-small border border-c1 savebtn link" @click="${this._saveNotes}">
									<span class="icon icon2">save</span>
									<span class="bold">Save Changes</span>
								</span>
							</div>
						`:null
					}
				</div>
			</section>
		`
	}
}

customElements.define('time-pad', timePad);