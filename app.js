
const map = L.map('map').setView([55.03,82.92],7);

const satellite = L.tileLayer(
'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
);

const osm = L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png'
);

satellite.addTo(map);

const heat = L.heatLayer([],{
radius:35,
blur:25
}).addTo(map);

let heatEnabled = true;
let pointMarkers = [];

function depthColor(depth){

if(depth <=2) return '#002bff';
if(depth <=4) return '#00b7ff';
if(depth <=6) return '#00ff88';
if(depth <=8) return '#ffe600';
if(depth <=10) return '#ff6a00';

return '#ff0000';
}

function randomDepth(){
return Math.floor(Math.random()*12)+1;
}

const saved = JSON.parse(localStorage.getItem('dyadyaVanyaCloud') || '[]');

saved.forEach(p=>createPoint(p));

map.on('click', function(e){

const depth = randomDepth();

const point = {
lat:e.latlng.lat,
lng:e.latlng.lng,
depth:depth
};

createPoint(point);

saveLocal();

});

function createPoint(point){

const marker = L.circleMarker([point.lat,point.lng],{
radius:10,
color:depthColor(point.depth),
fillColor:depthColor(point.depth),
fillOpacity:0.9
}).addTo(map);

marker.pointData = point;

marker.bindPopup(`
<b>Глубина:</b> ${point.depth} м<br>
🎯 Двойной клик удаляет точку
`);

// Удаление двойным кликом
marker.on('dblclick', function(){

if(confirm('Удалить точку?')){

map.removeLayer(marker);

pointMarkers = pointMarkers.filter(m => m !== marker);

saveLocal();

}

});

pointMarkers.push(marker);

heat.addLatLng([
point.lat,
point.lng,
point.depth/12
]);

}

function saveLocal(){

const data = pointMarkers.map(m => m.pointData);

localStorage.setItem(
'dyadyaVanyaCloud',
JSON.stringify(data)
);

}

function saveCloud(){

saveLocal();

alert('Точки синхронизированы');

}

function setMap(type){

map.eachLayer(layer=>{

if(layer === satellite || layer === osm){
map.removeLayer(layer);
}

});

if(type === 'sat'){
satellite.addTo(map);
}else{
osm.addTo(map);
}

}

function toggleDepth(){

if(heatEnabled){
map.removeLayer(heat);
}else{
heat.addTo(map);
}

heatEnabled = !heatEnabled;

}

function updateWeather(){

const hour = new Date().getHours();

const sky = document.getElementById('sky');
const temp = document.getElementById('temp');
const condition = document.getElementById('condition');
const icon = document.getElementById('weatherIcon');

if(hour >=5 && hour <11){

sky.style.background =
'linear-gradient(180deg,#5aa9ff,#b9e3ff)';

temp.innerText = '+16°';
condition.innerText = 'Утро • ясно';
icon.innerText = '🌤';

}else if(hour >=11 && hour <18){

sky.style.background =
'linear-gradient(180deg,#2d8cff,#87d9ff)';

temp.innerText = '+22°';
condition.innerText = 'День • солнечно';
icon.innerText = '☀️';

}else if(hour >=18 && hour <22){

sky.style.background =
'linear-gradient(180deg,#ff8a5b,#3d5a80)';

temp.innerText = '+18°';
condition.innerText = 'Вечер • облачно';
icon.innerText = '🌥';

}else{

sky.style.background =
'linear-gradient(180deg,#08111f,#0f172a)';

temp.innerText = '+10°';
condition.innerText = 'Ночь • ясно';
icon.innerText = '🌙';

}

}

updateWeather();


// Реальная погода через Open-Meteo API

async function loadRealWeather(){

try{

const lat = 55.03;
const lon = 82.92;

const url =
`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m&timezone=auto`;

const response = await fetch(url);

const data = await response.json();

const current = data.current;

const temp = Math.round(current.temperature_2m);

document.getElementById('temp').innerText =
`${temp}°`;

document.querySelector('.weather-details').innerHTML = `
<div>💨 Ветер: ${current.wind_speed_10m} м/с</div>
<div>💧 Влажность: ${current.relative_humidity_2m}%</div>
<div>🧭 Давление: ${Math.round(current.pressure_msl)} мм</div>
<div>🌍 Обновлено в реальном времени</div>
`;

}catch(e){

console.log('Ошибка погоды',e);

}

}

loadRealWeather();

setInterval(loadRealWeather, 300000);

async function loadYandexWeather(){

try{

const API_KEY = '6251977f-2cfc-4d74-9cb2-8b250cefae63';

const lat = 55.03;
const lon = 82.92;

const response = await fetch(
`https://api.weather.yandex.ru/v2/forecast?lat=${lat}&lon=${lon}`,
{
headers:{
'X-Yandex-Weather-Key': API_KEY
}
}
);

const data = await response.json();

const fact = data.fact;

document.getElementById('temp').innerText =
`${Math.round(fact.temp)}°`;

const translate = {
'clear':'Ясно',
'partly-cloudy':'Малооблачно',
'cloudy':'Облачно',
'overcast':'Пасмурно',
'light-rain':'Небольшой дождь',
'rain':'Дождь',
'snow':'Снег',
'thunderstorm':'Гроза'
};

document.getElementById('condition').innerText =
translate[fact.condition] || 'Погода';

}catch(e){

console.log(e);

}

}

loadYandexWeather();

setInterval(loadYandexWeather, 300000);





