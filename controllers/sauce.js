const Sauce = require('../models/ModelsSauce');
const fs    = require('fs'); // gestion des fichiers


exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const sauce = new Sauce({
      ...sauceObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      likes: 0,
      dislikes: 0,
      usersLiked:[""],
      usersDisliked: [""]
  });

  sauce.save()
  .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
  .catch(error => { res.status(400).json( { error })})
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({
    _id: req.params.id
  }).then(
    (sauce) => {
      res.status(200).json(sauce);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ? {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };

  delete sauceObject._userId;
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
          if (sauce.userId != req.auth.userId) {
              res.status(403).json({ message : 'Not authorized'});
          } else {
              Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
              .then(() => res.status(200).json({message : 'Objet modifié!'}))
              .catch(error => res.status(401).json({ error }));
          }
      })
      .catch((error) => {
          res.status(400).json({ error });
      });
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id})
      .then(sauce => {
          if (sauce.userId != req.auth.userId) {
              res.status(401).json({message: 'Not authorized'});
          } else {
              const filename = sauce.imageUrl.split('/images/')[1];
              fs.unlink(`images/${filename}`, () => {
                  Sauce.deleteOne({_id: req.params.id})
                      .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                      .catch(error => res.status(401).json({ error }));
              });
          }
      })
      .catch( error => {
          res.status(500).json({ error });
      });
};

exports.getAllSauce = (req, res, next) => {
  Sauce.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
        let vlikes      = sauce.likes;
        let vDislikes   = sauce.dislikes;
        let vUsersLiked = sauce.usersLiked;
        let vUsersDisliked = sauce.usersDisliked;
        switch (req.body.like) {
          case 1:
            vUsersLiked.push(req.body.userId);
            vlikes += 1;
            Sauce.updateOne({ _id: req.params.id}, {usersLiked:vUsersLiked, likes:vlikes})
            .then(() => res.status(200).json({message : 'Objet modifié!'}))
            .catch(error => res.status(401).json({ error }));    
            break;
          case 0:
            if (vUsersLiked.includes(req.body.userId)) {
              delete vUsersLiked[vUsersLiked.indexOf(req.body.userId)];
              vlikes -= 1;
            } 
            if (vUsersDisliked.includes(req.body.userId)) {
              delete vUsersDisliked[vUsersDisliked.indexOf(req.body.userId)];
              vDislikes -= 1;
            }
            Sauce.updateOne({ _id: req.params.id}, {usersLiked:vUsersLiked, usersDisliked:vUsersDisliked, likes:vlikes, dislikes:vDislikes})
            .then(() => res.status(200).json({message : 'Objet modifié!'}))
            .catch(error => res.status(401).json({ error }));
            break;
          case -1:
            vUsersDisliked.push(req.body.userId);
            vDislikes += 1;
            Sauce.updateOne({ _id: req.params.id}, {usersDisliked:vUsersDisliked, dislikes:vDislikes})
            .then(() => res.status(200).json({message : 'Objet modifié!'}))
            .catch(error => res.status(401).json({ error }));
            break;
          default:
            console.log(res.status(401).json({ error }));
        }

      })
      .catch((error) => {
        console.log(error);
          res.status(400).json({ error });
      })
};
