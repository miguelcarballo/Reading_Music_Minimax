//---------------
class Level{
    constructor(number, treble, bass, accidental, number_notes, highest_treble, lowest_treble, highest_bass, lowest_bass){
        this.number = number;
        this.treble = treble;
        this.bass = bass;
        this.accidental = accidental;
        this.number_notes = number_notes;
        this.highest_treble = highest_treble;
        this.lowest_treble = lowest_treble;
        this.highest_bass = highest_bass;
        this.lowest_bass= lowest_bass;
    }
}



class Flashcard{
    constructor(arrayNotesAnswer, arrayOfArraysOptions, clefSelected){
        this.arrayNotesAnswer = arrayNotesAnswer;
        this.arrayOfArraysOptions = arrayOfArraysOptions;
        this.clefSelected = clefSelected;
    }

    show(game){
        var stringNotes = this.arrayNotesAnswer[0]; //at least is going to have one note
        for(var i=1; i<this.arrayNotesAnswer.length; i++){
            stringNotes = stringNotes + " " + this.arrayNotesAnswer[i];
            if(i== this.arrayNotesAnswer.length-1){//the last note added
                stringNotes = "(" + stringNotes +")"; //to be a chord
            }
        }

        const { Factory, EasyScore, System } = Vex.Flow;

        const vf = new Factory({
        renderer: { elementId: 'score_div', width: 700, height: 700 },
        });

        const score = vf.EasyScore();
        const system = vf.System();

        system
        .addStave({
            voices: [
            //score.voice(score.notes(allNotes[40]+"/h," + allNotes[50])),
            //score.voice(score.notes(allNotes[40]+"/w")),
            //score.voice(score.notes("(C4 E4 G4)/w")),
            score.voice(score.notes(stringNotes+"/w", {clef: this.clefSelected})),
            ],
        })
        .addClef(this.clefSelected)
        .addTimeSignature('4/4');

        vf.draw();
        //buttons options
        this.arrayOfArraysOptions.push(this.arrayNotesAnswer);

        //shuffle the arrayOfArraysOptions
        var shuffled = this.arrayOfArraysOptions
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);

        this.arrayOfArraysOptions = shuffled;

        for(var i = 0; i < this.arrayOfArraysOptions.length; i++){
            var stringArrayOptions = this.arrayOfArraysOptions[i].join(",");
            var button = document.createElement('button');
            button.innerHTML = stringArrayOptions;
            button.onclick = function(event) {
                //game.process_human_answer(stringArrayOptions);
                game.process_human_answer(event.target.innerHTML)
              }
            // where do we want to have the button to appear?
            // you can append it to another element just by doing something like
            // document.getElementById('foobutton').appendChild(button);
            document.getElementById('button_div').appendChild(button);
            const lineBreak = document.createElement('br');
            document.getElementById('button_div').appendChild(lineBreak);
        }
    }
}


class NodeRegister{
    constructor(game){
        this.game = game;
        this.n_flashcards = game.n_flashcards_per_node;
        this.n_answers = game.n_possible_answers -1; //discount the actual right answer
        this.util = this.game.utilNotes;
        this.array_results = new Array();
        this.max_points_each = 1;
        this.counterN = 0;
        this.currentFlashcard = null;
    }

    generate_flashcard(){
        this.counterN = this.counterN + 1;
        var level = this.game.getCurrentLevel();
        var arrayNotesAnswer = null;
        var arrayOfArraysOptions = new Array();
        //get clef(s)
        var allPossibleClefs = new Array();
        if(level.treble){
            allPossibleClefs.push("treble");
        }
        if(level.bass){
            allPossibleClefs.push("bass");
        }
        var randomClefSelected = allPossibleClefs[Math.floor(Math.random() * allPossibleClefs.length)];
        //get note(s)
        if(randomClefSelected.localeCompare("treble") == 0){//it is treble
            arrayNotesAnswer = this.util.getRandomNotes(level.number_notes, level.accidental, level.highest_treble, level.lowest_treble, null);
            var randomExcludedNote = this.util.randomIntFromInterval(0,arrayNotesAnswer.length-1); //select one note to not repeat
            for(var i=0; i<this.n_answers; i++){
                var option = this.util.getRandomNotes(level.number_notes, level.accidental, level.highest_treble, level.lowest_treble, arrayNotesAnswer[randomExcludedNote]);
                arrayOfArraysOptions.push(option);
            }
        } else { //it is bass clef
            arrayNotesAnswer = this.util.getRandomNotes(level.number_notes, level.accidental, level.highest_bass, level.lowest_bass, null);
            var randomExcludedNote = this.util.randomIntFromInterval(0,arrayNotesAnswer.length-1); //select one note to not repeat
            for(var i=0; i<this.n_answers; i++){
                var option = this.util.getRandomNotes(level.number_notes, level.accidental, level.highest_bass, level.lowest_bass, arrayNotesAnswer[randomExcludedNote]);
                arrayOfArraysOptions.push(option);
            }
        }
        var flashcard = new Flashcard(arrayNotesAnswer, arrayOfArraysOptions, randomClefSelected);
        this.currentFlashcard = flashcard;
        flashcard.show(this.game);
    }


    process_answer(answer){
        //verify that answer is the same as the answer in flashcards
        //first: parse the answer
        var humanAnswerArray = answer.split(",");

        //verify that the arrays are the same as the current flashcard
        if(this.util.compareTwoArraysNotes(humanAnswerArray,this.currentFlashcard.arrayNotesAnswer)){
           alert("Right answer!");
           this.array_results.push(this.max_points_each);
        }else{
            var stringArrayOptions = this.currentFlashcard.arrayNotesAnswer.join(",");
            alert("Wrong answer. The answer is: " + stringArrayOptions);
            this.array_results.push(0);
        }

        //delete all current flashcards
        var myDiv = document.getElementById("button_div");
        myDiv.innerHTML = "";//remove all child elements inside of myDiv
        var myDiv = document.getElementById("score_div");
        myDiv.innerHTML = "";//remove all child elements inside of myDiv
        if(this.counterN == this.n_flashcards){ //if max flashcards per node got reached
            //process all node in algorithm
            //get the average points
            var sum = 0;
            for(var i=0; i<this.array_results.length; i++){
                sum = sum + this.array_results[i];
            }
            var avg = sum/this.array_results.length;
            var grade = "E"; //some grade
            //get the equivalent grade
            if(avg <= 0.25){
                grade = "D";
            }else if (avg <= 0.5){
                grade = "C";
            }else if (avg <= 0.75){
                grade = "B";
            }else{
                grade = "A";
            }
           // alert("the grade is " + grade);
           this.game.algorithm.set_human_answer(grade);

        }else{ //the node is not complete yet, generate the next flashcard


            this.generate_flashcard();
        }
    }


}


class UtilNotes{
    constructor(){
        var listNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        var allNotes = new Array();
        for(var i=1; i<=7; i++){
            for(var n=0; n<listNotes.length; n++){
                var newNote = listNotes[n] + i; //format will be F#4 for example
                allNotes.push(newNote);
            }
        }
        this.all_notes = allNotes;
    }

    getNoteFromIndex(index){
        return this.all_notes[index];
    }

    getIndexFromNote(name_note){
        var index = this.all_notes.indexOf(name_note);
        return index;
    }

    randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    cleanAccidental(index_note){
        var note = this.getNoteFromIndex(index_note);
        if(note.indexOf("#")==-1){ //no accidental
            return index_note;
        }else{ //has an accidental
            return index_note+1;
        }
    }

    compareTwoArraysNotes(array1, array2){
        var orderedArray1 = array1.sort();
        var orderedArray2 = array2.sort();
        for(var i=0; i<orderedArray1.length; i++){
            //if the notes has at least one difference, return false (not equal)
            if(orderedArray1[i].localeCompare(orderedArray2[i])!=0){ 
                return false;   
            }
        }
        return true; //if reaches this point, all the notes are equal
    }

    getRandomNotes(number_notes, accidental, highest, lowest, note_not_allowed){
        var index_high = this.getIndexFromNote(highest);
        var index_low = this.getIndexFromNote(lowest);
        var indexes_not_allowed_repeat= new Array();
        var array_name_notes = new Array();
        var array_index_notes = new Array();
        

        //include all that are in the note not allowed in order to not repeat 
        if(note_not_allowed != null){
            var index_not_allowed = this.getIndexFromNote(note_not_allowed);
            indexes_not_allowed_repeat.push(index_not_allowed);
        }
       
        for(var i = 0; i<number_notes; i++){
            var candidate_index = this.randomIntFromInterval(index_low, index_high);
            if(!accidental){ //clean accidentals if it is required
                 candidate_index = this.cleanAccidental(candidate_index);
            }
            while(indexes_not_allowed_repeat.indexOf(candidate_index)!=-1){ //they HAVE to be different(-1), repet until then
                candidate_index = this.randomIntFromInterval(index_low, index_high);
                if(!accidental){ //clean accidentals if it is required
                    candidate_index = this.cleanAccidental(candidate_index);
               }
            } 
            if(i==0){ //first time
                indexes_not_allowed_repeat.push(candidate_index);
                //array_name_notes.push(this.getNoteFromIndex(candidate_index)); //save all note names
                array_index_notes.push(candidate_index);
            }else{ //for the next notes
                //evaluate if are allowed (not repeated), if so, try again
                while(indexes_not_allowed_repeat.indexOf(candidate_index)!=-1){ //they HAVE to be different(-1), repet until then
                    candidate_index = this.randomIntFromInterval(index_low, index_high);
                } //after getting another value, save the new value
                indexes_not_allowed_repeat.push(candidate_index);
                //array_name_notes.push(this.getNoteFromIndex(candidate_index));
                array_index_notes.push(candidate_index);
            }    
        }
        //sort indexes
        var sorted_indexes = array_index_notes.slice().sort((a,b)=>a-b) // Make a copy with .slice()
        for(var i=0; i<sorted_indexes.length;i++){
            array_name_notes.push(this.getNoteFromIndex(sorted_indexes[i]));
        }
      
        return array_name_notes;
    }

   
   
}

class Game{
    constructor(){
        this.n_flashcards_per_node = 4;
        this.n_possible_answers = 4;
        
        var level1 = new Level(1,true, false, false, 1, "A5", "C4", null, null);
        var level2 = new Level(2,true, true, false, 1,  "C6", "G3", "E4", "C2");
        var level3 = new Level(3,true, true, true, 2,  "C6", "G3", "E4", "C2");
        var level4 = new Level(4,true, true, true, 3,  "C6", "G3", "E4", "C2");

        this.allLevels = Array(level1, level2, level3, level4);
        
        this.utilNotes = new UtilNotes();

        this.currentNode = new NodeRegister(this);
        this.currentLevelPointer = 0; 
        this.algorithm = new Algorithm(this);

        
    }

    getCurrentLevel(){
        return this.allLevels[this.currentLevelPointer];
    }

    showCurrentStatus(){
        //set texts to show current status
        var txtCurrentLevel = this.allLevels[this.currentLevelPointer].number;
        var txtCurrentPoints = this.algorithm.myBoard.points;
        document.getElementById("txtLevel").innerHTML = "Current Level: " + txtCurrentLevel;
        document.getElementById("txtPoints").innerHTML = "Current Points: " + txtCurrentPoints;
    }

    start_game(){
        this.currentNode.generate_flashcard();
        document.getElementById('btnStart').style.visibility = 'hidden';
        this.showCurrentStatus();
    }

    process_human_answer(answer){
        this.currentNode.process_answer(answer);
        //alert(answer);
    }

    setWinner(isAI, level_in){
        if(isAI){
            alert("GOOD JOB! your level is " + level_in);

        }else{
            alert("You need to practice more! your level is " + level_in);
        }
        window.location.reload(); //start over
    }

    getIndexLevel(level_in){
        for(var i=0; i<this.allLevels.length ; i++){
            if(this.allLevels[i].number == level_in){
                return i;
            }
        }
        return -1;
    }

    setLevel(level_in, points_in){
        this.currentLevelPointer = this.getIndexLevel(level_in);
        this.currentNode = new NodeRegister(this);
        alert("Set new level : " + level_in);
        this.currentNode.generate_flashcard();
    }
   
}