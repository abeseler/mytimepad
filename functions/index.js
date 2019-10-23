const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Creates the user document for new users
exports.createUserDoc = functions.auth.user().onCreate((user) => {
    let dt = new Date();
    let userData = {
        acctCreated: dt,
        displayName: user.displayName,
        email: user.email,
		lastUpdated: dt,
		photoURL: user.photoURL,
        uid: user.uid
    }
    return admin.firestore().doc(`/users/${user.uid}`).set(userData)
});

// Removed all user data when they delete their account
exports.removeUserData = functions.auth.user().onDelete((user) => {
	var promises = [];
	return admin.firestore().collection(`/users/${user.uid}/appData`)
		.get()
		.then(docs => {
			docs.forEach(doc => {
				promises.push(doc.ref.delete());
			});
		})
		.then(() => {
			promises.push(admin.firestore().doc(`/users/${user.uid}`).delete())
			return Promise.all(promises);
		})
		.catch(error => {
			console.log(error);
			return false;
		});
});