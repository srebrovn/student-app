var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));



var userSchema = new Schema({
	'username': { type: String, index: { unique: true, dropDups: true } },
	'email': { type: String, index: { unique: true, dropDups: true } },
	'password': {
		type: String,
		required: true
	},
	'token': { type: String },
	'admin': { type: Boolean, default: false },
	'photo': { type: String }
});
/*
userSchema.pre('save', function (next) {
	var user = this;
	bcrypt.hash(user.password, 10, function (err, hash) {
		if (err) {
			return next(err);
		}
		user.password = hash;
		next();
	});
});*/

userSchema.statics.authenticate = {
	password: function (username, password, callback) {
		console.log('authenticate', username, password)
		User.findOne({ username: username })
			.exec(function (err, user) {
				if (err) {
					return callback(err);
				} else if (!user) {
					var err = new Error("User not found.");
					err.status = 401;
					return callback(err);
				}
				bcrypt.compare(password, user.password, function (err, result) {
					console.log(err)
					if (result === true) {
						return callback(null, user);
					} else {
						return callback();
					}
				});

			});
	},
	photo: function (username, photo, callback) {
		User.findOne({ username })
			.exec(async function (error, user) {
				if (err) {
					return callback(err);
				} else if (!user) {
					var err = new Error("User not found.");
					err.status = 401;
					return callback(err);
				}



				const referencePhoto = user.photo;
				if (!referencePhoto) {
					var err = new Error("user does not have the photo set");
					err.status = 401;
					return callback(err);
				}

				try {
					const response = await fetch('http://localhost:8000/', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							face1: photo,
							face2: referencePhoto
						})
					});

					if (!response.ok) {
						throw new Error('Request failed');
					}

					const data = await response.json();
					console.log(data)
					if (data.same == "true") {
						return callback(null, user);
					} else {
						return callback();
					}
				} catch (error) {

					var err = new Error("Failed to compare faces");
					err.status = 401;
					return callback(err);
				}
			});
	}
}


var User = mongoose.model('user', userSchema);

//Create admin user if not in db
User.findOne(function (err, result) {
	if (err) console.error(err);
	if (!result) {
		bcrypt.hash((process.env.adminPassword || 'admin'), 10, function (err, hash) {
			var admin = new User({ username: 'admin', email: 'nomail', password: hash, admin: true })

			admin.save(function (err, admin) {
				if (err) return console.error(err);
				console.log("Admin user created.")
			})
		})
	}
	if (result) {
		console.log("Admin user already exists in database, not creating another");
	}
})

module.exports = User;
