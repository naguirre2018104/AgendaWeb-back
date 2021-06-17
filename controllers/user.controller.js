'use strict'

const User = require('../models/user.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt');
const fs = require('fs'); // Sirve para el manejo de archivos.
const path = require('path'); // Sirve para la ruta del archivo.


function prueba(req, res){
    console.log(req.user);
    res.status(200).send({message: 'Correcto'});
}

function uploadImage(req, res){
    var userId = req.params.id;
    var files = req.body;
    var fileName;

    if(userId != req.user.sub){
        res.status(403).send({message: 'No tienes permisos'});
    }else{
        if(req.files){
            // Ruta en la que llega la imagen.
            var filePath = req.files.image.path;
            // Split separa en jerarquía la ruta de la imagen. (Para linux es con solo una barra inversa "\").
            var fileSplit = filePath.split('\\');
            // Obtiene la número 2 sea el caso Documentos/Imágenes/Imagen.jpg 0/1/2.
            var fileName = fileSplit[2];
            // Separa la extensión de lo obtenido arriba y separa la extención Imagen.jpg 0.1.
            var extension = fileName.split('\.');
            var fileExt = extension[1];
            // Tipos de archivos de imagen que aprobará.
            if( fileExt == 'png' ||
                fileExt == 'jpg' ||
                fileExt == 'jpeg' ||
                fileExt == 'gif'){
                    User.findByIdAndUpdate(userId, {image: fileName}, {new:true}, (err, userUpdated)=>{
                        if(err){
                            res.status(500).send({message: 'Error general'});
                        }else if(userUpdated){
                            res.send({user: userUpdated, userImage:userUpdated.image});
                        }else{
                            res.status(400).send({message: 'No se ha podido actualizar'});
                        }
                    });
                }else{
                    fs.unlink(filePath, (err)=>{ // Se elimina el archivo por no tener una extensión válida.
                        if(err){
                            res.status(500).send({message: 'Extensión no válida y error al eliminar archivo'});
                        }else{
                            res.send({message: 'Extensión no válida'});
                        }
                    })
                }
        }else{
            res.status(400).send({message: 'No has enviado imagen a subir'});
        }
    }
}


function getImage(req, res){
    var fileName = req.params.fileName;
    var pathFile = './uploads/users/' + fileName;

    fs.exists(pathFile, (exists)=>{
        if(exists){
            res.sendFile(path.resolve(pathFile));
        }else{
            res.status(404).send({message: 'Imagen inexistente'});
        }
    })
}

function login(req, res){
    var params = req.body;
    
    if(params.username && params.password){
        User.findOne({username: params.username.toLowerCase()}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general en la verificación de la contraseña'});
                    }else if(checkPassword){
                        if(params.gettoken){
			    delete userFind.password
                            return res.send({ token: jwt.createToken(userFind), user: userFind});
                        }else{
                            return res.send({ message: 'Usuario logeado', user:userFind});
                        }
                    }else{
                        return res.status(401).send({message: 'Contrasea incorrecta'});
                    }
                })
            }else{
                return res.send({message: 'Ususario no encontrado'});
            }
        }).populate("contacts")
    }else{
        return res.status(401).send({message: 'Por favor ingresa los datos obligatorios'});
    }
}

function saveUser(req, res){
    var user = new User();
    var params = req.body;

    if(params.name && params.username && params.email && params.password){
        User.findOne({username: params.username.toLowerCase()}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general en el servidor'});
            }else if(userFind){
                return res.send({message: 'Nombre de usuario ya en uso'});
            }else{
                bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general en la encriptación'});
                    }else if(passwordHash){
                        user.password = passwordHash;
                        user.name = params.name;
                        user.lastname = params.lastname;
                        user.role = 'ROLE_USER';
                        user.username = params.username.toLowerCase();
                        user.email = params.email.toLowerCase();

                        user.save((err, userSaved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al guardar'});
                            }else if(userSaved){
                                return res.send({message: 'Usuario guardado', userSaved});
                            }else{
                                return res.status(500).send({message: 'No se guardó el usuario'});
                            }
                        })
                    }else{
                        return res.status(401).send({message: 'Contraseña no encriptada'});
                    }
                })
            }
        })
    }else{
        return res.send({message: 'Por favor ingresa los datos obligatorios'});
    }
}

function saveUserByAdmin(req, res) {
    var userId = req.params.id;
    var user = new User();
    var params = req.body;

    if(userId != req.user.sub){
        res.status(401).send({message: 'No tienes permiso para crear usuarios en esta ruta'})
    }else{
        if(params.name && params.username && params.email && params.password && params.role){
            User.findOne({username: params.username}, (err, userFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general en el servidor'});
                }else if(userFind){
                    return res.send({message: 'Nombre de usuario ya en uso'});
                }else{
                    bcrypt.hash(params.password, null, null, (err, passwordHash)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general en la encriptación'});
                        }else if(passwordHash){
                            user.password = passwordHash;
                            user.name = params.name;
                            user.lastname = params.lastname;
                            user.role = params.role;
                            user.username = params.username.toLowerCase();
                            user.email = params.email.toLowerCase();
    
                            user.save((err, userSaved)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al guardar'});
                                }else if(userSaved){
                                    return res.send({message: 'Usuario guardado', userSaved});
                                }else{
                                    return res.status(500).send({message: 'No se guardó el usuario'});
                                }
                            })
                        }else{
                            return res.status(401).send({message: 'Contraseña no encriptada'});
                        }
                    })
                }
            })
        }else{
            return res.send({message: 'Por favor ingresa los datos obligatorios'});
        }
    }
}

function updateUser(req, res){
    let userId = req.params.id;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(401).send({ message: 'No tienes permiso para realizar esta acción'});
    }else{
        if(update.password || update.role){
            return res.status(401).send({ message: 'No se puede actualizar la contraseña ni el rol desde esta función'});
        }else{
            if(update.username){
                User.findOne({username: update.username.toLowerCase()}, (err, userFind)=>{
                    if(err){
                        return res.status(500).send({ message: 'Error general'});
                    }else if(userFind){
                        if(userFind._id == req.user.sub){
                            User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general al actualizar'});
                                }else if(userUpdated){
                                    return res.send({message: 'Usuario actualizado', userUpdated});
                                }else{
                                    return res.send({message: 'No se pudo actualizar al usuario'});
                                }
                            })
                        }else{
                            return res.send({message: 'Nombre de usuario ya en uso'});
                        }
                    }else{
                        User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al actualizar'});
                            }else if(userUpdated){
                                return res.send({message: 'Usuario actualizado', userUpdated});
                            }else{
                                return res.send({message: 'No se pudo actualizar al usuario'});
                            }
                        })
                    }
                })
            }else{
                User.findByIdAndUpdate(userId, update, {new: true}, (err, userUpdated)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al actualizar'});
                    }else if(userUpdated){
                        return res.send({message: 'Usuario actualizado', userUpdated});
                    }else{
                        return res.send({message: 'No se pudo actualizar al usuario'});
                    }
                })
            }
        }
    }
    
}


function removeUser(req, res){
    let userId = req.params.id;
    let params = req.body;

    if(userId != req.user.sub){
        return res.status(403).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        User.findOne({_id: userId}, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general al eliminar'});
            }else if(userFind){
                bcrypt.compare(params.password, userFind.password, (err, checkPassword)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al verificar contraseña'});
                    }else if(checkPassword){
                        User.findByIdAndRemove(userId, (err, userRemoved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al eliminar'});
                            }else if(userRemoved){
                                return res.send({message: 'Usuario eliminado', userRemoved});
                            }else{
                                return res.status(403).send({message: 'Usuario no eliminado'});
                            }
                        })
                    }else{
                        return res.status(401).send({message: 'Contraseña incorrecta, no puedes eliminar tu cuenta sin tu contraseña'});
                    }
                })
            }else{
                return res.status(403).send({message: 'Usuario no eliminado'});
            } 
        })
    }
}

function getUsers(req, res){
    User.find({}).populate('contacts').exec((err, users)=>{
        if(err){
            return res.status(500).send({message: 'Error general en el servidor'})
        }else if(users){
            return res.send({message: 'Usuarios: ', users})
        }else{
            return res.status(404).send({message: 'No hay registros'})
        }
    })
}

function searchUser(req, res){
    var params = req.body;

    if(params.search){
        User.find({$or:[{name: params.search},
                        {lastname: params.search},
                        {username: params.search}]}, (err, resultSearch)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general'});
                            }else if(resultSearch){
                                return res.send({message: 'Coincidencias encontradas: ', resultSearch});
                            }else{
                                return res.status(403).send({message: 'Búsqueda sin coincidencias'});
                            }
                        })
    }else{
        return res.status(403).send({message: 'Ingrese datos en el campo de búsqueda'});
    }
}



module.exports = {
    prueba,
    saveUser,
    login,
    updateUser,
    removeUser,
    getUsers,
    searchUser,
    uploadImage,
    getImage,
    saveUserByAdmin
}