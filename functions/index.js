const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Tomamos una referencia hacia nuestra Base de datos en firebase
var db = admin.database();

// "/test/sample/data" es un ejemplo de la estructura en la BD, 
// usted puede cambiarlo de acuerdo a sus necesidades
var ref = db.ref("/test/sample/data");

// el elemento "ref" apunta a la lista de usuarios de nuestra bases de datos
var usersRef = ref.child("users");

const app = require('express')();

//Funcion para retornar a pagina principal. 
app.get('/api/', (req, res) => {  
  res.send(`Root API page`);
});

//Funcion para obtener datos usando metodo GET
app.get('/api/users', (req, res) => {  
  usersRef.once('value', function(data) {
    if (data.val()) {

      let result = [];

      data.forEach(function(item) {
        result.push(item.val());
      });

      res.status(200).send(result)
    } else {
      res.status(200).send([])
    }
  }, function(error) {
    console.log(error)
    res.status(500).send({ message: "Unknown Error" });

  });
});

//Funcion para agregar un nuevo usuario
app.post('/api/users', (req, res) => {  
  let newUserData = req.body;
  
  // creamos un nuevo elemento en la coleccion "users" en la BD  
  var newUserRef = usersRef.push();

  // adicionamos la clave generada al objeto "id"
  newUserData.id = newUserRef.key;
  
  // Almaceno el objeto json en el elemento ref creado antes
  newUserRef.set(newUserData);

  // Enviamos respuesta de creacción exitosa con POST (201 CREATED - Ver RFC 2616)
  res.status(201).send(newUserData)
});

//Podemos buscar un valor mediante el id 
app.get('/api/users/:id', (req, res) => {  

  let userRef = usersRef.child(`${req.params.id}`);

  // Como nosotros leemos un simple valor desde la BD 
  userRef.once('value', function(value){
    let result = value.val() 
    
    if (result) {
      res.status(200).send(result);
    } else {  
      res.status(404).send({ message: "Not Found" });
    }
    
  }, function(error) {
    console.log(error)
    res.status(500).send({ message: "Unknown Error" });

  })
});

// Publicar la funcion:
exports.api = functions.https.onRequest(app); 
