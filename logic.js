/*yes i'm putting whole freaking logic into one file, but go kill yourself js you are stupid and let me use my imports damn it*/
let Canvas;
let Context;
let Gates = [];
let ImageFolder = "gates";
var GateDrawingStyle;
(function (GateDrawingStyle) {
    GateDrawingStyle[GateDrawingStyle["Shapes"] = 0] = "Shapes";
    GateDrawingStyle[GateDrawingStyle["Images"] = 1] = "Images";
})(GateDrawingStyle || (GateDrawingStyle = {}));
let GridCellWidth = 25;
let GridCellHeight = 25;
let NodeConnectionPointRadius = 5;
let CurrentlyMovedGate = null;
;
/**Array contanting all of the operative values
 * To initialize a variable before execution set variables here
 * TODO: make it editable via editor page
*/
let Variables = {
    "x": true,
    "y": true,
    "z": true
};
/**Base class for every gate. Using inheritance to avoid function duplication */
class Gate {
    _ImagePath;
    Color;
    isVariable = false;
    x;
    y;
    width = 100;
    height = 100;
    value = false;
    processed = false;
    get Value() {
        if (!this.processed) {
            this.Process();
        }
        return this.value;
    }
    /**All of the gates connected as input */
    inputs = [];
    GateImage;
    set ImagePath(path) {
        this._ImagePath = path;
        this.GateImage.src = "./" + ImageFolder + "/" + path;
    }
    get ImagePath() {
        return this._ImagePath;
    }
    Process() {
        this.value = false;
        this.processed = true;
    }
    Draw(x, y, ctx, Style) {
        switch (Style) {
            case GateDrawingStyle.Shapes:
                ctx.fillStyle = 'yellow';
                ctx.fillRect(x, y, 100, 100);
                break;
            case GateDrawingStyle.Images:
                ctx.drawImage(this.GateImage, x, y);
                break;
        }
    }
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.GateImage = new Image();
        this.GateImage.src = "./" + ImageFolder + "/" + this.ImagePath;
    }
}
class AndGate extends Gate {
    constructor(x, y) {
        super(x, y);
        this.ImagePath = "and.png";
    }
    Process() {
        //AND gate uses "and"(&), what a surpise!
        this.value = this.inputs[0].Value && this.inputs[1].Value;
        this.processed = true;
    }
}
class NotGate extends Gate {
    constructor(x, y) {
        super(x, y);
        this.ImagePath = "not.png";
    }
    Process() {
        this.value = !this.inputs[0].Value;
        this.processed = true;
    }
}
class OrGate extends Gate {
    constructor(x, y) {
        super(x, y);
        this.ImagePath = "or.png";
    }
    Process() {
        this.value = this.inputs[0].Value || this.inputs[1].Value;
        this.processed = true;
    }
}
/**This type of gate has no functionality that changes how the thing works, but allows to store the variables */
class VariableGate extends Gate {
    varibaleName = "x";
    get Value() {
        if (!this.processed) {
            this.Process();
        }
        return Variables[this.varibaleName];
    }
    Process() {
        if (this.inputs[0] != null) {
            Variables[this.varibaleName] = this.inputs[0].Value;
        }
        this.processed = true;
    }
    constructor(x, y, name) {
        super(x, y);
        this.varibaleName = name;
        this.isVariable = true;
    }
}
/**Depenging on this value different styles might be used(Maybe add better way of choosing?) */
let Style = GateDrawingStyle.Images;
class ConnectionPoint {
    //value that the point is currently holding
    value;
}
function Draw() {
    Context.clearRect(0, 0, 480, 480);
    Gates.forEach(elem => {
        elem.Draw(elem.x, elem.y, Context, Style);
    });
}
/**Set proper values in the editor page */
function UpdateDisplayValues() {
    for (const key in Variables) {
        let value = document.getElementById(key);
        value.checked = Variables[key];
    }
}
/**Executes all nodes and chage */
function Run() {
    //reset the gates
    Gates.forEach(gate => {
        gate.processed = false;
    });
    //read variables from settings
    for (const key in Variables) {
        let value = document.getElementById(key);
        Variables[key] = value.checked;
    }
    //we run for each variable causing it to process functions up the tree
    Gates.forEach(gate => {
        //TODO: only process variables that have no outputs
        if (gate.isVariable) {
            gate.Process();
        }
    });
    UpdateDisplayValues();
}
function MakeDebugChain() {
    //z = !x&y
    let x = new VariableGate(0, 0, "x");
    let not = new NotGate(150, 0);
    let x1 = new VariableGate(250, 0, "x");
    let and = new AndGate(0, 150);
    let y = new VariableGate(150, 150, "y");
    let z = new VariableGate(150, 150, "z");
    not.inputs.push(x);
    x1.inputs.push(not);
    and.inputs.push(x1);
    and.inputs.push(y);
    z.inputs.push(and);
    Gates.push(x);
    Gates.push(not);
    Gates.push(x1);
    Gates.push(y);
    Gates.push(and);
    Gates.push(z);
}
function Init() {
    Canvas = document.getElementById("editorCanvas");
    if (Canvas != null) {
        Context = Canvas.getContext('2d');
        //for test we will just create new image object
        //first define canvas
        Canvas.width = 480;
        Canvas.height = 480;
        MakeDebugChain();
        window.addEventListener('mousedown', function (e) {
            if (e.ctrlKey) {
                //add new gate
                Gates.push(new AndGate(e.x, e.y));
            }
            else {
                //start dragging
                //find the gate under the mouse
                Gates.forEach(elem => {
                    if (e.x >= elem.x &&
                        e.y >= elem.y &&
                        e.x <= elem.x + elem.width &&
                        e.y <= elem.y + elem.height) {
                        CurrentlyMovedGate = elem;
                    }
                });
            }
            Draw();
        });
        window.addEventListener('mousemove', function (e) {
            if (CurrentlyMovedGate != null) {
                CurrentlyMovedGate.x = GridCellWidth * Math.floor((e.x - CurrentlyMovedGate.width / 2) / GridCellWidth);
                CurrentlyMovedGate.y = GridCellHeight * Math.floor((e.y - CurrentlyMovedGate.height / 2) / GridCellHeight);
            }
            Draw();
        });
        window.addEventListener('mouseup', function (e) {
            if (CurrentlyMovedGate != null) {
                //drop the gate
                CurrentlyMovedGate = null;
            }
            Draw();
        });
        window.addEventListener('keydown', function (e) {
        });
    }
}
/* Tests*/
function RunTests() {
}
