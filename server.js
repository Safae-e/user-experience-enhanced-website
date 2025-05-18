// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

const postUrl = 'https://fdnd-agency.directus.app/items/fabrique_users_fabrique_art_objects'
const userId = 4


// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({extended: true}))

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express());

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

// Maak een GET route voor de index (meestal doe je dit in de root, als /)
app.get('/', async function (request, response) {
  // Render index.liquid uit de Views map
  // Geef hier eventueel data aan mee
  const apiResponse = await fetch('https://fdnd-agency.directus.app/items/fabrique_art_objects?fields=*,image.id,image.width,image.height');
  const apiResponseJSON = await apiResponse.json();
   
  console.log(apiResponse)
  response.render('index.liquid', { artworks: apiResponseJSON.data});

})

// GET route object.liquid
app.get('/object/:id/', async function (request, response) {
  const artworkId = request.params.id;
  const apiResponse = await fetch(`https://fdnd-agency.directus.app/items/fabrique_art_objects/${artworkId}?fields=title,image,summary,objectNumber,site,displayDate,artist,materials,recordType`
  );
  const apiResponseJSON = await apiResponse.json();
  console.log(apiResponse);  

  response.render('object.liquid', {object: apiResponseJSON.data});
})


app.post('/like/:id', async function(request, response){ 
  const artworkId = request.params.id

  console.log(artworkId)

  console.log(artworkId, userId)

  await fetch(postUrl, {
    method: 'POST',
    body: JSON.stringify({
      fabrique_users_id: userId,
      fabrique_art_objects_id: artworkId,
    }),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  })

  response.redirect(303, '/');
})


app.post('/unlike/:id', async function (request, response) {
  const artworkId = request.params.id;

  // Stap 1: Zoek het like-record op via filter
  const responseLikes = await fetch(`https://fdnd-agency.directus.app/items/fabrique_users_fabrique_art_objects?filter={"fabrique_users_id":${userId},"fabrique_art_objects_id":${artworkId}}`);
  const responseLikesJSON = await responseLikes.json();

  // Stap 2: Haal het ID van de like-record op
  const likeToDelete = responseLikesJSON.data[0];
  if (likeToDelete) {
    const likeId = likeToDelete.id;

    // Stap 3: Verwijder dit specifieke record
    await fetch(`https://fdnd-agency.directus.app/items/fabrique_users_fabrique_art_objects/${likeId}`, {
      method: 'DELETE'
    });
  }

  // Stap 4: Redirect terug naar /likes (of geef JSON response als je JS gebruikt)
  response.redirect(303, '/likes');
});



// GET route likes.liquid
app.get('/likes/', async function (request, response) {

  // Haal de objecten op die geliket zijn 
  const apiResponse = await fetch(`https://fdnd-agency.directus.app/items/fabrique_users_fabrique_art_objects?filter=%7B%22fabrique_users_id%22:${userId}%7D`);
  const apiResponseJSON = await apiResponse.json();

  //  Gebruik Set om de unieke objecten bij te houden, Als het object al is toegevoegd (artworkId zit al in de Set), wordt het niet nogmaals toegevoegd.
  const uniqueArtworkIds = new Set();
  // Nu moeten we de objecten ophalen
  const likedArtworks = [];

  // Itereer(doorloopt elk object in de array één voor één, zodat je de bijbehorende gegevens (fabrique_art_objects_id) kunt ophalen en verwerken.) over de gelikte objecten en haal de details van elk object op
  for (const like of apiResponseJSON.data) {
    const artworkId = like.fabrique_art_objects_id;

    if (!uniqueArtworkIds.has(artworkId)) {
      uniqueArtworkIds.add(artworkId);

    const artworkDetailsResponse = await fetch(`https://fdnd-agency.directus.app/items/fabrique_art_objects/${artworkId}?fields=title,image`);
    const artworkDetails = await artworkDetailsResponse.json();
    
    // Voeg het object toe aan de lijst van gelikte objecten
    // unshift-> zorgt ervoor dat de laatst gelikte objecten vooraan komen te staan
    likedArtworks.unshift(artworkDetails.data);
    
  }
  }
  response.render('likes.liquid', { likedArtworks: likedArtworks });
});


app.use((req, res, next) => {
  res.status(404).send("Sorry can't find that!")
})

console.log('Let op: Er zijn nog geen routes. Voeg hier dus eerst jouw GET en POST routes toe.')


// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`Daarna kun je via http://localhost:${app.get('port')}/ jouw interactieve website bekijken.\n\nThe Web is for Everyone. Maak mooie dingen 🙂`)
})
