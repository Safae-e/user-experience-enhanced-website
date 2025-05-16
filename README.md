
# Qatar Museums
[Link website](https://user-experience-enhanced-website-vxh1.onrender.com/)

## Beschrijving
<!-- Bij Beschrijving staat kort beschreven wat voor project het is en wat je hebt gemaakt -->
<!-- Voeg een mooie poster visual toe 📸 -->
<!-- Voeg een link toe naar je live site 🌐-->

Voor het Qatar Museums project heb ik een website gemaakt waarop bezoekers een overzicht krijgen van alle kunstobjecten. De website bestaat uit meerdere pagina’s, waaronder een homepagina waarop alle objecten worden weergegeven. Gebruikers kunnen op deze pagina kunstobjecten ‘liken’ die ze interessant vinden.

Alle gelikete objecten worden automatisch opgeslagen en zijn later terug te vinden op de 'likes'-pagina, waar je jouw favorieten gemakkelijk kunt bekijken en opnieuw kunt bezoeken. Klik je op een object, dan ga je naar een detailpagina met meer informatie over het kunstwerk, zoals de titel en de kunstenaar.

### Homepagina
![image](https://github.com/user-attachments/assets/7447a97a-de7a-4198-b315-6ecbbde2105a)

### Detailpagina
![image](https://github.com/user-attachments/assets/6f8f93e4-cf4f-4112-b25c-e832618f5564) ![image](https://github.com/user-attachments/assets/2526eca1-7f74-4a7e-a60c-d9ec0b3ce5df)

## Loading state

## Succes state

## Kenmerken
<!-- Bij Kenmerken staat welke technieken zijn gebruikt en hoe. Wat is de HTML structuur? Wat zijn de belangrijkste dingen in CSS? Wat is er met JS gedaan en hoe? Misschien heb je iets met NodeJS gedaan, of heb je een framwork of library gebruikt? -->

Voor deze website heb ik zowel server-side als client-side scripting gebruikt. De data wordt opgevraagd vanaf de server (server-side) en vervolgens dynamisch ingeladen in de pagina's met behulp van Liquid templates. Hierdoor wordt de content – zoals de kunstobjecten – automatisch ingevuld op basis van de data die van de server wordt opgehaald. Dit zorgt ervoor dat de website flexibel is en makkelijk aangepast kan worden wanneer de data verandert.
In de server haal ik de data op via een fetch-oproep binnen een route.
```
  app.get('/', async function (request, response) {
  const apiResponse = await fetch('https://fdnd-agency.directus.app/items/fabrique_art_objects?fields=*,image.id,image.width,image.height');
  const apiResponseJSON = await apiResponse.json();

  response.render('index.liquid', { artworks: apiResponseJSON.data });
});
```
 Daarna gebruik ik een for-loop in mijn Liquid-template om de afbeeldingen uit de database op de pagina weer te geven.
 ```
{% for artwork in artworks %}
    <li class="li-gallery">
      <a href="/object/{{ artwork.id }}">
        <img src="https://fdnd-agency.directus.app/assets/{{ artwork.image.id }}" width="{{ artwork.image.width }}" height="{{ artwork.image.height }}" alt="{{ artwork.title }}">
      </a>
      <form action="/like/{{ artwork.id }}" method="post">
        <button class="like-button"></button>
      </form>
    </li>
  {% endfor %}

```
## Installatie
<!-- Bij Installatie staat hoe een andere developer aan jouw repo kan werken -->
Dit project is gemaakt met Node.js. Om de website zelf te kunnen draaien, moet je eerst Node.js installeren op je computer. Vervolgens open je de terminal, daar voer je het commando npm install uit om alle benodigde pakketten te installeren. Als dat klaar is, start je de server met npm start. De website is daarna te bekijken in je browser via http://localhost:8000.
## Bronnen

## Licentie

This project is licensed under the terms of the [MIT license](./LICENSE).
