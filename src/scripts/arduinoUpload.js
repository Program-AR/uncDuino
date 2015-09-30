Arduino = {
    placas: {},
    enviadores: [],
    //Constructores
    Placa: function(idHW){
        this.idHW = idHW;
        this.correccionDireccionMotores = '';
    },

    elegirEnviador: function(){
        this.enviadores.forEach(function(CEnv){
            var env = new CEnv();
            if(env.corresponde()){
                this.enviador = env;
            }
        }.bind(this));
    },
};

Arduino.EnviadorOS = function(){
    nombrePrograma = '';
}
Arduino.EnviadorOS.prototype = {
    escribirProgramaADisco: function(){
        var fs = require('fs');
        fs.writeFileSync(this.pathPrograma(), Blockly.Arduino.workspaceToCode(Blockly.mainWorkspace));
        console.log("Archivo creado en" + this.pathPrograma());
    },
    enviar: function(){
        var exec = require('child_process').exec;
        exec(this.comando(), function(error, stdout, stderr) {
            console.log("Salida del comando:\n" + stdout + "\nSalida de error:\n" + stderr);
            window.alert("Envío terminado");
        });
    },
    pathPrograma: function(){
        var path = require('path');
        return path.resolve(path.dirname(process.execPath), this.nombrePrograma + '.ino' );
    },

    addPropsFrom: function(otherObj){
        for(attrname in otherObj){
            this[attrname] = otherObj[attrname];
        }
        return this;
    }
};

Arduino.EnviadorWindows = function(){};

Arduino.EnviadorWindows.prototype = (new Arduino.EnviadorOS()).addPropsFrom( {
    corresponde: function(){
        var os = require('os');
        return os.platform() === 'win32'; // && (process.arch === 'x64' || process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432'));

    },
    comando: function(){
        return this.path + " -v --board multiplo:avr:" + Arduino.placaElegida.idHW + " --upload " + this.pathPrograma();
    },
});


//Defaults
Arduino.enviadores = [Arduino.EnviadorWindows];
Arduino.elegirEnviador();
if (Arduino.enviador){
    Arduino.enviador.nombrePrograma = 'programa';
    Arduino.enviador.path = '\"C:\\Documents and Settings\\Alf\\Escritorio\\arduino-1.6.5-r5-windows\\arduino-1.6.5-r5\\arduino_debug.exe\"';
}
Arduino.placas.duinobot23 = new Arduino.Placa("DuinoBotv2x_1284_HID");
Arduino.placas.duinobot12 = new Arduino.Placa("DuinoBotv1x_HID");
Arduino.placas.duinobot12.correccionDireccionMotores = "motor1.setClockwise(false);\n ";
Arduino.placaElegida = Arduino.placas.duinobot23;

Blockly.Arduino.configuracion = {
    placa: Arduino.placaElegida,
    pinIR: "A0",
    pinUS: "A1",
    pinLI: "A2",
    pinLD: "A3",
};

function guardarConfig(){
    pines = ["pinIR", "pinUS", "pinLI", "pinLD"];
    pines.forEach(function(pin){
        Blockly.Arduino.configuracion[pin] = document.getElementById(pin).value;
    });
    Blockly.Arduino.configuracion.placa = Arduino.placas[document.getElementById('placa').value];
}

function enviarAlRobot(){
    if(!Arduino.enviador){
        window.alert("BUUHH... Por algún problema no se puede enviar el código al robot. Vas a tener que copiar manualmente el código de la solapa \"Arduino\" al programa Arduino IDE")
        return;
    };
    Arduino.enviador.escribirProgramaADisco();
    Arduino.enviador.enviar();
}



