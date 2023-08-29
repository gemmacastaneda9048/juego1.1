
var config = {
    type: Phaser.AUTO, //El objeto
    width: 800,//Ancho de la pantalla(estaba en 800)
    height: 600,//Alto de la pantalla (estaba en 600)
    physics:{
        default: 'arcade',
        arcade: {
            gravity:{y: 300},
            debug: false
        }
    },
    scene: {//nuevo objeto
        preload: preload,
        create: create,
        update: update
    }

};
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;

var game = new Phaser.Game(config);

function preload(){
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star','assets/star.png');
    this.load.image('bomb','assets/bomb.png');
    this.load.spritesheet('dude','assets/dude.png', {frameWidth: 32, frameHeight: 48});

}

function create(){
    this.add.image(400,300,'sky');//this.add.image(x,y,'nombr de la imagen') carga la imagen al navegador indicando los pixeles en x, y
    platforms = this.physics.add.staticGroup();//crea un nuevo grupo de elementos estáticos con física y lo asigna a la variable local platforms
    platforms.create(400,568,'ground').setScale(2).refreshBody();//pone la imagen en el suelo //refreshBody() es necesaria ya que se ha escalado un cuerpo físico estático, por lo que es necesario avisar al sistema de físicas sobre los cambios que hicimos.

    platforms.create(600, 400, 'ground');
    platforms.create(50, 250, 'ground');
    platforms.create(750, 220, 'ground');

    player = this.physics.add.sprite(100, 450,'dude');//Se crea el jugador (el sprite: imagen o gráfico que se utiliza en aplicaciones o juegos para representar objetos, personajes o elementos visuales dentro de una escena) que será afectado por las reglas de física configuradas
    player.setCollideWorldBounds(true);
    player.setBounce(0.2);//un pequeño rebote

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude',{start:0,end: 3}),
        frameRate: 10,//cantidad de fotogramas por seg
        repeat: -1 //la animacion vuelve a empezar cuando termina
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4}],//usa el fotograma 4
        frameRate: 20//cantidad de fotogramas por seg
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude',{start:5,end: 8}), //empieza en el fotograma 5 y termina en el 8
        frameRate: 10,//cantidad de fotogramas por seg
        repeat: -1 //la animacion vuelve a empezar cuando termina
    });

    //player.body.setGravityY(300);
    this.physics.add.collider(player, platforms);//Detecta la colisión o superposición de dos objetos. En este caso se le está indicando que monitorice si hay contacto entre el sprite del personaje (player) y el grupo de plataformas (platforms).

    cursors = this.input.keyboard.createCursorKeys();//crea el objeto 'cursors' con cuatro propiedades: up, down, left, right

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    stars.children.iterate(function (child) {
    
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    
    });

    this.physics.add.collider(stars, platforms);//habilitar que las estrellas colisionen con las plataformas
    this.physics.add.overlap(player, stars, collectStar, null, this);//comprobar si el personaje se superpone con alguna estrella

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });

    bombs = this.physics.add.group();

    this.physics.add.collider(bombs, platforms);

    this.physics.add.collider(player, bombs, hitBomb, null, this);

}

function update(){

    if(gameOver){
        return
    }

    if(cursors.left.isDown)//verificar si la tecla izquierda está presionada. Si es así, se aplica una velocidad horizontal negativa y se ejecuta la animación 'left'.
    {
        player.setVelocityX(-160);
        player.anims.play('left',true);
    }
    else if(cursors.right.isDown)//Si por el contrario se pulsa la tecla derecha se hace literalmente lo contrario.
    {
        player.setVelocityX(160);
        player.anims.play('right',true);
    }
    else
    {//Cuando no se mantiene presionada ninguna tecla se activa la animación 'turn' y se pone a cero la velocidad horizontal.
        player.setVelocityX(0);
        player.anims.play('turn');
    }
    if(cursors.up.isDown && player.body.touching.down)//La tecla de salto es el cursor hacia arriba y se comprueba si está pulsada. También se verifica si el personaje está tocando el suelo, ya que de lo contrario podría saltar mientras está en el aire.
    {
        player.setVelocityY(-330);//Si se cumplen estas dos condiciones, se aplica una velocidad vertical de 330 px / seg. 
    }

}

function collectStar (player, star)//si hay una superposición entre el personaje y cualquier estrella en el grupo de estrellas. Si tienen contacto, se ejecuta la función 'collectStar' pasándole los dos objetos implicados
{
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);

    if(stars.countActive(true)===0)
    {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
        var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
}

function hitBomb (player, bomb)
{
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}