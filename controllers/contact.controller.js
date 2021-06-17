'use strict'

var User = require('../models/user.model');
var Contact = require('../models/contact.model');

function setContact(req, res){
    var userId = req.params.id;
    var params = req.body;
    var contact = new Contact();

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'})
    }else{
        User.findById(userId, (err, userFind)=>{
            if(err){
                return res.status(500).send({message: 'Error general'})
            }else if(userFind){
                contact.name = params.name;
                contact.lastname = params.lastname;
                contact.phone = params.phone;

                contact.save((err, contactSaved)=>{
                    if(err){
                        return res.status(500).send({message: 'Error general al guardar'})
                    }else if(contactSaved){
                        User.findByIdAndUpdate(userId, {$push:{contacts: contactSaved._id}}, {new: true}, (err, contactPush)=>{
                            if(err){
                                return res.status(500).send({message: 'Error general al agergar contacto'})
                            }else if(contactPush){
                                return res.send({message: 'Contacto agregado', contactPush});
                            }else{
                                return res.status(500).send({message: 'Error al agregar contacto'})
                            }
                        }).populate("contacts")
                    }else{
                        return res.status(404).send({message: 'No se guardó el contacto'})
                    }
                })
            }else{
                return res.status(404).send({message: 'El usuario al que deseas agregar el contacto no existe.'})
            }
        })
    }
}

function updateContact(req, res){
    let userId = req.params.idU;
    let contactId = req.params.idC;
    let update = req.body;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permiso para realizar esta acción'});
    }else{
        if(update.name && update.phone){
            Contact.findById(contactId, (err, contactFind)=>{
                if(err){
                    return res.status(500).send({message: 'Error general al buscar'});
                }else if(contactFind){
                    User.findOne({_id: userId, contacts: contactId}, (err, userFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general en la busqueda de usuario'});
                        }else if(userFind){
                            Contact.findByIdAndUpdate(contactId, update, {new: true}, (err, contactUpdated)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error general en la actualización'});
                                }else if(contactUpdated){
                                    return res.send({message: 'Contacto actualizado', contactUpdated});
                                }else{
                                    return res.status(404).send({message: 'Contacto no actualizado'});
                                }
                            })
                        }else{
                            return res.status(404).send({message: 'Usuario no encontrado'})
                        }
                    })
                }else{
                    return res.status(404).send({message: 'Contacto a actualizar inexistente'});
                }
            })
        }else{
            return res.status(404).send({message: 'Por favor ingresa los datos mínimos para actualizar'});
        }
    }
}

function removeContact(req, res){
    let userId = req.params.idU;
    let contactId = req.params.idC;

    if(userId != req.user.sub){
        return res.status(500).send({message: 'No tienes permisos para realizar esta acción'});
    }else{
        User.findOneAndUpdate({_id: userId, contacts: contactId},
            {$pull:{contacts: contactId}}, {new:true}, (err, contactPull)=>{
                if(err){
                    return res.status(500).send({message: 'Error general'});
                }else if(contactPull){
                    Contact.findByIdAndRemove(contactId, (err, contactRemoved)=>{
                        if(err){
                            return res.status(500).send({message: 'Error general al eliminar contacto'});
                        }else if(contactRemoved){
                            return res.send({message: 'Contacto eliminado', contactPull});
                        }else{
                            return res.status(500).send({message: 'Contacto no encontrado, o ya eliminado'});
                        }
                    })
                }else{
                    return res.status(500).send({message: 'No se pudo eliminar el contacto del usuario'});
                }
            }).populate('contacts')
    }
}

module.exports = {
    setContact,
    updateContact,
    removeContact
}