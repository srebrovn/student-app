var UserModel = require('../models/userModel.js');
const jwt = require("jsonwebtoken");
var bcrypt = require('bcryptjs');
const { spawn } = require('child_process');


/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.list()
     */
    list: function (req, res) {
        UserModel.find(function (err, users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            return res.json(users);
        });
    },

    /**
     * userController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({ _id: id }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }


            return res.json(user);
        });
    },

    /**
     * userController.create()
     */
    create: async function (req, res) {
        var user = new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        });
        const usernameExists = await UserModel.findOne({ username: user.username });
        const emailExists = await UserModel.findOne({ email: user.email });

        if (usernameExists && emailExists) {
            return res.status(400).json({
                message: "Username and email already exists",
            });
        } else if (usernameExists) {
            return res.status(400).json({
                message: "Username already exists",
            });
        } else if (emailExists) {
            return res.status(400).json({
                message: "Email already exists",
            });
        } else {

            bcrypt.hash(user.password, 10, function (err, hash) {
                if (err) {
                    return next(err);
                }
                user.password = hash;
                user.save(function (err, user) {
                    if (err) {
                        return res.status(500).json({
                            message: 'Error when creating user',
                            error: err
                        });
                    }
                    var email = user.email
                    const token = jwt.sign(
                        { userId: user._id, email },
                        process.env.TOKEN_KEY,
                        {
                            expiresIn: "5h",
                        }
                    );
                    user.token = token;
                    user.save(function (err, user) {
                        if (err) {
                            return res.status(500).json({
                                message: 'Error when creating user',
                                error: err
                            });
                        }

                        return res.status(201).json(user);
                    });

                });
            });


        }
    },

    /**
     * userController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({ _id: id }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            user.username = req.body.username ? req.body.username : user.username;
            user.email = req.body.email ? req.body.email : user.email;
            user.password = req.body.password ? req.body.password : user.password;

            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating user.',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
    },

    /**
     * userController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the user.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    showRegister: function (req, res) {
        res.render('user/register');
    },

    showLogin: function (req, res) {
        res.render('user/login');
    },

    login: function (req, res, next) {
        UserModel.authenticate.password(req.body.username, req.body.password, function (err, user) {
            if (err || !user) {
                var err = new Error('Wrong username or password');
                err.status = 401;
                return next(err);
            }
            req.session.userId = user._id;

            var email = user.email
            const token = jwt.sign(
                { userId: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "5h",
                }
            );
            user.token = token;
            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating user',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
    },

    loginPhoto: async function (req, res, next) {

        UserModel.authenticate.photo(req.body.username, req.body.photo, function (err, user) {
            if (err) {
                err.status = 401;
                return next(err);
            }
            else if (!user) {
                var err = new Error('Wrong username or password');
                err.status = 401;
                return next(err);
            }
            req.session.userId = user._id;

            var email = user.email
            const token = jwt.sign(
                { userId: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "5h",
                }
            );
            user.token = token;
            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating user',
                        error: err
                    });
                }
                req.session.userId = user._id;

                return res.json(user);
            });
        });
    },

    logout: function (req, res, next) {
        if (req.session) {
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                } else {

                    return res.status(201).json({});
                }
            });
        }
    },

    jwtAuth: function (req, res, next) {
        const token =
            req.body.token || req.query.token || req.headers["x-access-token"];

        if (!token) {
            return res.status(403).send("A token is required for authentication");
        }
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_KEY);
            console.log(decoded)
            req.session.userId = decoded.userId;
        } catch (err) {
            return res.status(401).send("Invalid Token");
        }
        UserModel.findOne({ _id: req.session.userId }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            return res.json(user);
        });
    },

    getJwt: function (req, res) {
        UserModel.findOne({ _id: req.session.userId }, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }

            var email = user.email
            const token = jwt.sign(
                { userId: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "5h",
                }
            );
            user.token = token;

            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when creating jwt.',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
    },

    profile: function (req, res, next) {
        var id = req.params.id;
        UserModel.findById(id)
            .exec(function (error, user) {
                if (error) {
                    return next(error);
                } else {
                    if (user === null) {
                        var err = new Error('Not authorized, go back!');
                        err.status = 400;
                        return next(err);
                    } else {
                        //return res.render('user/profile', user);
                        return res.json(user);
                    }
                }
            });
    },

    updatePhoto: async function (req, res) {
        const userId = req.params.id;;
        const photo = req.body.photo;

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        user.photo = photo;
        await user.save();

        return res.status(200).json({
            message: "User photo updated successfully"
        });
    },

    loginPhotoTest: async function (req, res, next) {

        var photo = req.body.photo;
        var username = req.body.username;

        UserModel.findOne({ username })
            .exec(async function (error, user) {
                if (error) {
                    console.log(error);
                    return next(error);
                } else {

                    if (user === null) {
                        var err = new Error('User not found');
                        err.status = 400;
                        return next(err);
                    } else {

                        const referencePhoto = user.photo;
                        if (!referencePhoto) {
                            return res.json({
                                error: true,
                                message: "user does not have the photo set"
                            });
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
                            if (data.same == "true") {
                                req.session.userId = user._id;

                                return res.json(user);
                            } else {
                                return res.json({
                                    message: "faces do not match"
                                });
                            }
                        } catch (error) {
                            console.log(error)
                            res.status(500).send({ error: 'Failed to compare faces' });
                        }
                    }
                }
            });


    }



};

