var controllers = require('./controllers');
var mid = require('./middleware');

var router = function(app){
	app.get("/login", mid.requiresSecure, controllers.Account.gamePage);
	app.post("/login", mid.requiresSecure, controllers.Account.login);

	app.get("/signup", mid.requiresSecure, mid.requiresLogout, controllers.Account.signupPage);
	app.post("/signup", mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

	app.get("/logout", mid.requiresLogin, controllers.Account.logout);

	app.get("/record", mid.requiresLogin, controllers.Record.recordPage);
	app.post("/record", mid.requiresLogin, controllers.Record.addRecord);

	app.get("/highscore", controllers.Record.highScorePage);

	app.get("/", mid.requiresSecure, controllers.Account.gamePage);
};

module.exports = router;