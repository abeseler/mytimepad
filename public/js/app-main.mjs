import { html } from 'https://cdn.pika.dev/-/lit-element/2.2.1/dist-es2019/lit-element.min.js';
import { stylesSuper } from './styles-super.mjs';
import './app-banner.mjs';
import './my-timepad.mjs';

class appMain extends stylesSuper {
	static get properties() {
		return {
			showInstallBtn: { type: Boolean },
			showLoader: { type: Boolean },
			snapshots: { type: Array },
			snapId: { type: String },
			uid: { type: String },
			userData: { type: Object },
			userDeleted: { type: Boolean }
		};
	}

	static get styles() {return [super.styles];}

	constructor() {
		super();
		App.main = this;
		this.showLoader = localStorage.getItem('signedIn') ? true : false;
		this.snapshots = [];
		this.userDeleted = false;
	}

	render() {
		return html`
			<app-banner .uid="${this.uid}" .userData="${this.userData}" ?showloader="${this.showLoader}" ?showinstallbtn="${this.showInstallBtn}"></app-banner>
			<main class="auto">
				${this.showLoader?
					html`
						<section class="container section center">
							<div class="auto card border c4" style="max-width:600px">
								<h4 class="padding-small txt-c3">Authenticating user ... please wait</h4>
							</div>
						</section>
					`:null
				}
				${this.userDeleted?
					html`
						<section class="container section center">
							<div class="auto card border c4" style="max-width:600px">
								<h4 class="padding-small txt-c3">Your account and all associated data has been deleted</h4>
							</div>
						</section>
					`:null
				}
				${this.uid?
					html`
						<my-timepad></my-timepad>
					`:html`
						<section class="container center">
							<h2 class="txt-c5">Welcome to MyTimepad!</h2>
							<p class="container large">MyTimepad is a web app built to simplify tracking time and keeping related notes all in one place.</p>
							<p class="container large">Note: You will need to sign in with a Google account to use this app.</p>
							<div class="container half left-align">
								<div class="container section leftbar border-c2 card">
									<ul class="ul padding-small">
										<h4 class="txt-c2">Completed Features:</h4>
										<li>Create new timepads and track time spent per day and by project</li>
										<li>View a detailed timesheet of all recorded time entries</li>
										<li></li>
									</ul>
								</div>
							</div>
							<div class="container half left-align">
								<div class="container section leftbar border-c3 card">
									<ul class="ul padding-small">
										<h4 class="txt-c3">Under Development:</h4>
										<li>Ability to modify or delete entries on a timesheet</li>
										<li>View a history of completed timepads</li>
										<li>Notes section to jot down quick notes related to the project</li>
										<li>Abilty to track time people spend supporting or shadowing you</li>
										<li>Installable version with full offline capability</li>
									</ul>
								</div>
							</div>
						</section>
					`
				}
			</main>
			<footer class="bar small bottom c5">
				<div class="bar-item right hover-txt-c4" style="cursor:not-allowed">
					<span class="icon" style="vertical-align:-15%">history</span>
					<span>History</span>
				</div>
			</footer>
		`;
	}

	updated(changedProp) {
		changedProp.forEach((oldval, name) => {
			App.logPost(`[${this.constructor.name}] ${name} >> ${JSON.stringify(this[name])}`);
		});
	}

	snapListener(snapData) {
		this.userData = snapData;
	}

	addSnapshot(firebasePath, obj, qParam) {
		let snapshot;
		if (qParam) {
			snapshot = {
				snapRef: firebasePath,
				subscribed: obj.constructor.name,
				uuid: App.uuid(),
				unsubscribe: firebase.firestore().collection(firebasePath)
					.where(qParam.field,qParam.op,qParam.val)
					.orderBy('lastModified','desc')
					.onSnapshot(docs => {
						obj.snapListener(docs);
					})
			}
		} else {
			snapshot = {
				snapRef: firebasePath,
				subscribed: obj.constructor.name,
				uuid: App.uuid(),
				unsubscribe: firebase.firestore().doc(firebasePath).onSnapshot(doc => {
					obj.snapListener(doc.data());
				})
			}
		}
		this.snapshots.push(snapshot);
		this.snapshots = this.snapshots.filter(s=>{return true;});
		return snapshot.uuid;
	}

	removeSnapshot(snapId) {
		this.snapshots = this.snapshots.filter(snap => {
			if (snap.uuid == snapId) {
				snap.unsubscribe();
				return false;
			} else {
				return true;
			}
		})
	}

	_signIn() {
		localStorage.setItem('signedIn', 'true');
		let googleProvider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithRedirect(googleProvider);
	}

	_signOut() {
		localStorage.removeItem('signedIn');
		App.main.snapshots = App.main.snapshots.filter(snap => {
			snap.unsubscribe();
			return false;
		});
		firebase.auth().signOut();
	}

	_deleteAccount() {
		localStorage.removeItem('signedIn');
		App.main.snapshots = App.main.snapshots.filter(snap => {
			snap.unsubscribe();
			return false;
		});
		firebase.auth().currentUser.delete().then(() => {
			App.main.userDeleted = true;
		})
	}

	_installApp() {
		App.installPrompt.prompt();
		App.installPrompt.userChoice
			.then(result => {
				if (result.outcome === 'accepted') {
					App.logPost(`>>[${this.constructor.name}] INSTALL::SUCCESS >> App was installed`);
				} else {
					App.logPost(`[${this.constructor.name}] INSTALL::FAIL >> Install prompt was dismissed`);
				}
				App.installPrompt = null;
				App.main.showInstallBtn = false;
			});
	}
}

firebase.auth().onAuthStateChanged(firebaseUser => {
	if (firebaseUser) {
		App.main.uid = firebaseUser.uid;
		App.main.showLoader = false;
		App.main.snapId = App.main.addSnapshot(`users/${firebaseUser.uid}`, App.main);
	} else {
		App.main.uid = null;
		App.main.userData = null;
	}
});

customElements.define('app-main', appMain);