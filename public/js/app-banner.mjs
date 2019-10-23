import { html, css } from 'https://cdn.pika.dev/-/lit-element/2.2.1/dist-es2019/lit-element.min.js';
import { stylesSuper } from './styles-super.mjs'

class appBanner extends stylesSuper {
	static get properties() {
		return {
			showAcctOptions: { Boolean },
			showInstallBtn: { type: Boolean },
			showLoader: { type: Boolean },
			snapId: { type: String },
			uid: { type: String },
			userData: { type: Object }
		};
	}

	static get styles() {return [super.styles,
		css`
			.logo{
				border-right:3px double var(--c4);
				font-variant:small-caps;
				padding-right:6px;
			}
		`
	];}

	constructor() {
		super();
	}

	render() {
		return html`
			<header class="bar top c2 large">
				<div class="bar-item">
					<span class="logo bold">MyTimepad</span>
				</div>
				${this.uid?
					html`
						<div class="bar-item right">
							${this.userData?html`<img class="circle card link" src="${this.userData.photoURL}" style="height:20px;width:20px" @click="${() => {this.showAcctOptions=this.showAcctOptions?false:true}}" />`:null}
						</div>
						${this.showAcctOptions?html`
							<div class="bar-item padding-small right small bold txt-c4 hover-txt-c1 link" style="margin-top:8px" @click="${App.main._signOut}">
								Sign Out
							</div>
							<div class="bar-item padding-small right small bold txt-c4 hover-txt-c3 link" style="margin-top:8px" @click="${App.main._deleteAccount}">
								Delete Account
							</div>
						`:null}
					`:this.showLoader?null:html`
						<div class="bar-item right">
							<div class="tag card round-small medium leftbar c1 border-c4 hover-border-c3 link" @click="${App.main._signIn}"><img alt="GoogleLogo" src="./img/google.svg" style="height:14px;margin-right:4px;vertical-align:-10%" /> Sign in</div>
						</div>
					`
				}
				${this.showInstallBtn?
					html`
						<div class="bar-item right">
							<div class="round large txt-c4 hover-txt-c1 link" @click="${App.main._installApp}"><span class="icon">get_app</span> Install</div>
						</div>
					`:null
				}
			</header>
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
}

customElements.define('app-banner', appBanner);