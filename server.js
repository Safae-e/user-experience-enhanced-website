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
  const apiResponse = await fetch('https://fdnd-agency.directus.app/items/fabrique_art_objects');
  const apiResponseJSON = await apiResponse.json();

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
  response.redirect(303, '/')
})

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

    // Als dit artwork ID nog niet is toegevoegd aan de Set, haal dan de details op
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

//  // Als er ergens op de pagina een formulier wordt gesubmit..
//   // (We maken hier gebruik van Event Delegation)
//   document.addEventListener('submit', async function(event) {

//     // Hou in een variabele bij welk formulier dat was
//     const form = event.target

//     // Als dit formulier geen data-enhanced attribuut heeft, doe dan niks speciaals (laat het formulier normaal versturen)
//     // Dit doen we, zodat we sommige formulieren op de pagina kunnen 'enhancen'
//     // Door ze bijvoorbeeld data-enhanced="true" of data-enhanced="formulier-3" te geven.
//     // Data attributen mag je zelf verzinnen: https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Solve_HTML_problems/Use_data_attributes
//     if (!form.hasAttribute('data-enhanced')) {
//       return
//     }

//     // Voorkom de standaard submit van de browser
//     // Let op: hiermee overschrijven we de default Loading state van de browser...
//     event.preventDefault()

//     // Verzamel alle formuliervelden van het formulier
//     let formData = new FormData(form)

//     // En voeg eventueel de name en value van de submit button toe aan die data
//     // https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent/submitter
//     if (event.submitter) {
//       formData.append(event.submitter.name, event.submitter.value)
//     }

//     // Doe een fetch naar de server, net als hoe de browser dit normaal zou doen
//     // Gebruik daarvoor het action en method attribuut van het originele formulier
//     // Inclusief alle formuliervelden
//     const response = await fetch(form.action, {
//       method: form.method,
//       body: new URLSearchParams(formData)
//     })

//     // De server redirect op de normale manier, en geeft HTML terug
//     // (De server weet niet eens dat deze fetch via client-side JavaScript gebeurde)
//     const responseText = await response.text()

//     // Normaal zou de browser die HTML parsen en weergeven, maar daar moeten we nu zelf iets mee
//     // Parse de nieuwe HTML en maak hiervan een nieuw Document Object Model in het geheugen
//     const parser = new DOMParser()
//     const responseDOM = parser.parseFromString(responseText, 'text/html')

//     // Zoek in die nieuwe HTML DOM onze nieuwe UI state op, die we via Liquid hebben klaargemaakt
//     // We gebruiken hiervoor het eerdere data-enhanced attribuut, zodat we weten waar we naar moeten zoeken
//     // In de nieuwe HTML zoeken we bijvoorbeeld naar data-enhanced="true" of data-enhanced="formulier-3"
//     // (Hierdoor kunnen we ook meerdere formulieren op dezelfde pagina gebruiken)
//     const newState = responseDOM.querySelector('[data-enhanced="' + form.getAttribute('data-enhanced') + '"]')

//     // Overschrijf ons formulier met de nieuwe HTML
//     // Hier wil je waarschijnlijk de Loading state vervangen door een Success state
//     form.outerHTML = newState.outerHTML

//   })

/*
// Zie https://expressjs.com/en/5x/api.html#app.get.method over app.get()
app.get(…, async function (request, response) {
  
  // Zie https://expressjs.com/en/5x/api.html#res.render over response.render()
  response.render(…)
})
*/

/*
// Zie https://expressjs.com/en/5x/api.html#app.post.method over app.post()
app.post(…, async function (request, response) {

  // In request.body zitten alle formuliervelden die een `name` attribuut hebben in je HTML
  console.log(request.body)

  // Via een fetch() naar Directus vullen we nieuwe gegevens in

  // Zie https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch over fetch()
  // Zie https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify over JSON.stringify()
  // Zie https://docs.directus.io/reference/items.html#create-an-item over het toevoegen van gegevens in Directus
  // Zie https://docs.directus.io/reference/items.html#update-an-item over het veranderen van gegevens in Directus
  await fetch(…, {
    method: …,
    body: JSON.stringify(…),
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });

  // Redirect de gebruiker daarna naar een logische volgende stap
  // Zie https://expressjs.com/en/5x/api.html#res.redirect over response.redirect()
  response.redirect(303, …)
})
*/


// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set('port', process.env.PORT || 8000)

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`Daarna kun je via http://localhost:${app.get('port')}/ jouw interactieve website bekijken.\n\nThe Web is for Everyone. Maak mooie dingen 🙂`)
})
