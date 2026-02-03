 //**DOM references and config
 const dropSound = new Audio('assets/mixkit-game-ball-tap-2073.wav')
 const STORAGE_KEY = 'seesaw_objects';
 const MAX_ANGLE=30;
 const PLANK_LENGTH=400;
 const OBJECT_COLORS = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#0EA5E9'];  
 const SHAPES = ['square', 'circle'];

 const seesawArea = document.querySelector('.seesaw-area');
 const seesawPlank= document.querySelector('.seesaw-plank');
 const leftWeightDisplay=document.getElementById('left-side-weight');
 const rightWeightDisplay=document.getElementById('right-side-weight');
 const angleDisplay=document.getElementById('angle-tilt');
 const resetButton = document.getElementById('reset-btn');
 const pivot = document.querySelector('.pivot');
 const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

 let nextObject = null;
 let objects = [];

 //starters
 seesawPlank.addEventListener('click', handleClickPlank);
 resetButton.addEventListener('click', handleReset);
 window.addEventListener('load', () => {
 
    const savedTheme = localStorage.getItem('theme') || 'light';
    updateThemeUI(savedTheme);
    generateNextObject();
    loadState();
   
 });


 //** State Management

const saveState = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(objects));

 const loadState = () => {
   const saved= localStorage.getItem(STORAGE_KEY);
   if (saved){
     objects = JSON.parse(saved);
     objects.forEach(createObject);
     updateSeesawPhysics();
   }
 }

 themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    updateThemeUI(newTheme);
    localStorage.setItem('theme', newTheme);
});

 //** Calculating torque and angle

function updateSeesawPhysics(){
    let leftTorque = 0;
    let rightTorque = 0; 
    let leftWeight = 0 ;
    let rightWeight =0;

   
    objects.forEach(obj => {
        const torque = obj.weight * Math.abs(obj.distance); 
        if (obj.distance < 0) {
            leftTorque += torque;
            leftWeight += obj.weight;
        } else if (obj.distance > 0) {       
            rightTorque += torque;
            rightWeight += obj.weight;   
        }   
    });

   // update UI
   const torqueDifference = rightTorque - leftTorque;
   const angle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, torqueDifference / 50));
   
   //write values
   document.querySelector('#left-side-weight + .value').innerText = `${leftWeight} kg`;
   document.querySelector('#right-side-weight + .value').innerText = `${rightWeight} kg`;
   document.querySelector('#angle-tilt + .value').innerText = `${angle.toFixed(1)}°`;
   
   //rotate plank
   seesawPlank.style.transform = `rotate(${angle}deg)`; 
 }


   //**Functions


   
 function generateNextObject() {
   nextObject = {        
     weight: Math.floor(Math.random() * 10) + 1,
     shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
     colorIndex: Math.floor(Math.random() * OBJECT_COLORS.length)
   };
   renderNextObjectPreview();
 }

 function renderNextObjectPreview() {
   
    const previewBox = document.getElementById('next-object');
    const weightLabel = document.getElementById('next-weight');
    const objectLabel = document.getElementById('next-object-label');

    previewBox.className = 'preview-object';
    previewBox.style.backgroundColor = 'transparent';
    previewBox.style.borderLeft = 'none';
    previewBox.style.borderRight = 'none';
    previewBox.style.borderBottom = 'none';

    const color = OBJECT_COLORS[nextObject.colorIndex];
    const size = 30 + nextObject.weight * 2;

    previewBox.classList.add(nextObject.shape);
    previewBox.style.width = `${size}px`;
    previewBox.style.height = `${size}px`;
    previewBox.style.backgroundColor = color;
   
   
   weightLabel.textContent = nextObject.weight;
   objectLabel.textContent = nextObject.weight;

   console.log(nextObject);

 }


  
 function createObject(obj){
     const element = document.createElement('div');
     element.classList.add('weight-object', obj.shape);
   
   const size = 30 + (obj.weight * 4);// heavier obj -> larger
   const color = OBJECT_COLORS[obj.colorIndex];

    element.style.width = `${size}px`; 
    element.style.height = `${size}px`;
    element.style.backgroundColor = color;
    element.style.display = 'flex';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
   
   const label = document.createElement('span');
   label.textContent = obj.weight;
   element.appendChild(label);
   
   element.style.left = (obj.x / PLANK_LENGTH) * 100 + "%"
   element.style.transform = 'translateX(-50%)';

   seesawPlank.appendChild(element);

 }
 const updateThemeUI = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    themeIcon.innerText = theme === 'dark' ? '☀' : '⏾';
};




 //*** Event handlers

 //clickable area and click function
 function handleClickPlank(event){
   const rect = seesawPlank.getBoundingClientRect();
   const clickX = event.clientX - rect.left; //

   const distanceFromCenter = clickX - (rect.width / 2); // + right, - left, 0 center

   const newObj ={
     x: clickX,
     distance:distanceFromCenter,
     weight:nextObject.weight,
     shape:nextObject.shape,
     colorIndex:nextObject.colorIndex
   }

   playDropSound();
   objects.push(newObj);
   createObject(newObj);
   updateSeesawPhysics();
   saveState();
   generateNextObject();

 }

 //reset items
 function handleReset(){ 
   localStorage.removeItem(STORAGE_KEY);
   objects = [];
   seesawPlank.innerHTML='';
   updateSeesawPhysics();

 }

 //sound
 function playDropSound(){
    dropSound.volume=0.5;
    dropSound.play().catch(console.error("Voice effect not working"));
 }



