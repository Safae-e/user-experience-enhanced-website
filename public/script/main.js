 // Als er ergens op de pagina een formulier wordt gesubmit..
  // (We maken hier gebruik van Event Delegation)
document.addEventListener('submit', async function(event) {

    // Hou in een variabele bij welk formulier dat was
    const form = event.target;

    // Als dit formulier geen data-enhanced attribuut heeft, doe dan niks speciaals (laat het formulier normaal versturen)
    // Dit doen we, zodat we sommige formulieren op de pagina kunnen 'enhancen'
    // Door ze bijvoorbeeld data-enhanced="true" of data-enhanced="formulier-3" te geven.
    // Data attributen mag je zelf verzinnen: https://developer.mozilla.org/en-US/docs/Learn_web_development/Howto/Solve_HTML_problems/Use_data_attributes
    if (!form.hasAttribute('data-enhanced')) {
      return;
    }

    // Voorkom de standaard submit van de browser
    // Let op: hiermee overschrijven we de default Loading state van de browser...
    event.preventDefault();

    //  Verkrijg de like button
    const likeButton = form.querySelector('.like-button');
    
    // Voeg de 'liked' klasse toe als de knop geklikt is
    likeButton.classList.add('liked'); // Dit zorgt ervoor dat de knop verandert naar een vol hartje

    // Verzamel alle formuliervelden van het formulier
    let formData = new FormData(form);

    // En voeg eventueel de name en value van de submit button toe aan die data
    // https://developer.mozilla.org/en-US/docs/Web/API/SubmitEvent/submitter
    if (event.submitter) {
        formData.append(event.submitter.name, event.submitter.value)
      }

    // Doe een fetch naar de server, net als hoe de browser dit normaal zou doen
    // Gebruik daarvoor het action en method attribuut van het originele formulier
    // Inclusief alle formuliervelden
    const response = await fetch(form.action, {
      method: form.method,
      body: new URLSearchParams(formData)
    });

    // De server redirect op de normale manier, en geeft HTML terug
    // (De server weet niet eens dat deze fetch via client-side JavaScript gebeurde)
    const responseText = await response.text();

    // Normaal zou de browser die HTML parsen en weergeven, maar daar moeten we nu zelf iets mee
    // Parse de nieuwe HTML en maak hiervan een nieuw Document Object Model in het geheugen
    const parser = new DOMParser();
    const responseDOM = parser.parseFromString(responseText, 'text/html');

    // Zoek in die nieuwe HTML DOM onze nieuwe UI state op, die we via Liquid hebben klaargemaakt
    // We gebruiken hiervoor het eerdere data-enhanced attribuut, zodat we weten waar we naar moeten zoeken
    // In de nieuwe HTML zoeken we bijvoorbeeld naar data-enhanced="true" of data-enhanced="formulier-3"
    // (Hierdoor kunnen we ook meerdere formulieren op dezelfde pagina gebruiken)
    const newForm = responseDOM.querySelector('[data-enhanced="' + form.getAttribute('data-enhanced') + '"]');
    
    // Overschrijf ons formulier met de nieuwe HTML
    // Hier wil je waarschijnlijk de Loading state vervangen door een Success state
    form.outerHTML = newForm.outerHTML;

  });

    // view transition opstarten
    function animateCards() { 

    // Selecteer alle elementen met de class 'li-gallery' (elke kaart dus)
    const cards = document.querySelectorAll('.li-gallery');
      cards.forEach((card, index) => {

        // Stel een vertraging in per kaart, zodat ze na elkaar verschijnen
        // Hoe hoger index, hoe later deze kaart verschijnt
        setTimeout(() => {
          card.classList.add('show');
        }, index * 30); // vertraging per kaart
      });
    }
  
  document.addEventListener('DOMContentLoaded', animateCards);


  document.addEventListener('click', async function (event) {
    const button = event.target;
  
    // Check of de klik op een like-button is
    if (button.classList.contains('like-button')) {
      const form = button.closest('form');
      const artworkId = form.querySelector('input[name="artwork_id"]').value;
      const isLiked = button.classList.contains('liked');
  
      if (isLiked) {
        // Unlike: Verwijder de like uit de database
        await fetch(`/unlike/${artworkId}`, {
          method: 'POST',
        });
  
        // Verwijder 'liked' class zodat het hartje visueel leeg wordt
        button.classList.remove('liked');
  
        // Verwijder het hele object van de pagina (alleen op likespagina)
        const card = button.closest('li');
        if (card) {
          card.remove();
        }
      } else {
        // Like: Voeg de like toe aan de database
        await fetch(`/like/${artworkId}`, {
          method: 'POST',
        });
  
        // Voeg 'liked' class toe zodat het hartje visueel vol wordt
        button.classList.add('liked');
      }
    }
  });



// document.addEventListener('click', async function (event) {
//     const button = event.target;
  
//     // Alleen reageren op knoppen met de like-button class
//     if (button.classList.contains('like-button')) {
//       const form = button.closest('form');
//       const artworkId = form.querySelector('input[name="artwork_id"]').value;
//       const isLiked = button.classList.contains('liked');
//       const onLikesPage = window.location.pathname === '/likes/';
  
//       if (isLiked && onLikesPage) {
//         event.preventDefault(); // voorkom standaard formuliergedrag
  
//         // Verstuur POST-verzoek naar de nieuwe unlike-route
//         await fetch(`/unlike/${artworkId}`, {
//           method: 'POST'
//         });
  
//         // Verwijder het object visueel van de pagina
//         const li = form.closest('li');
//         if (li) li.remove();
  
//         // Controleer of er nog objecten over zijn
//         const container = document.querySelector('.card-container');
//         if (container && container.children.length === 0) {
//           container.outerHTML = '<p>Je hebt nog geen objecten geliket.</p>';
//         }
//       }
//     }
//   });
  