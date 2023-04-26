class Algorithm{
    constructor(game){
        this.game = game;

        this.startHumanVal = 0;
        this.currentLevel = this.game.allLevels[this.game.currentLevelPointer].number;
        this.maxPossiblePoints = 30;
        this.minPossiblePoints = -30;
        this.maxLevel = this.game.allLevels.length;
        this.maxDepth = 4;
        this.myBoard = { level: this.game.allLevels[this.game.currentLevelPointer].number, points: 0};
        this.allNodes = new Array();

        this.extreme = -1;
        
        this.possibleMovesAI = ["P", "R", "G"]; //pass, repeat, go back
        this.possibleMovesHuman = ["A", "B", "C", "D"];

        //------First version----
        /*this.humanTable1 = { A: 5, B: -2, C: -3, D: -4 };
        this.aiTable1A = { P: 5, R: -2, G: -3 };
        this.aiTable2A = { P: 5, R: -4, G: -5 };
        this.aiTable3A = { P: 5, R: -6, G: -7 };
        this.aiTable4A = { P: 5, R: -8, G: -9 };
        this.aiTable1B = { P: -1, R:  5, G: -2 };
        this.aiTable2B = { P: -2, R:  5, G: -2 };
        this.aiTable3B = { P: -3, R:  5, G: -2 };
        this.aiTable4B = { P: -4, R: 5, G: -2 };
        this.aiTable1C = { P: -2, R: 1, G: -2 };
        this.aiTable2C = { P: -3, R: 1, G: -2 };
        this.aiTable3C = { P: -4, R: 0, G: 1 };
        this.aiTable4C = { P: -5, R: 0, G: 1 };
        this.aiTable1D = { P: -5, R: 5, G: 3 };
        this.aiTable2D = { P: -6, R: 4, G: 5 };
        this.aiTable3D = { P: -7, R: 4, G: 5 };
        this.aiTable4D = { P: -8, R: 4, G: 5 };*/

        //--------fixed version-------
        this.humanTable1 = { A: 5, B: -2, C: -3, D: -4 };
        this.aiTable1A = { P: 1, R: -2, G: -3 };
        this.aiTable2A = { P: 1, R: -4, G: -5 };
        this.aiTable3A = { P: 1, R: -6, G: -7 };
        this.aiTable4A = { P: 1, R: -8, G: -9 };
        this.aiTable1B = { P: -1, R:  1, G: -2 };
        this.aiTable2B = { P: -2, R:  1, G: -2 };
        this.aiTable3B = { P: -3, R:  1, G: -2 };
        this.aiTable4B = { P: -4, R: 1, G: -2 };
        this.aiTable1C = { P: -2, R: -1, G: -2 };
        this.aiTable2C = { P: -3, R: -1, G: -2 };
        this.aiTable3C = { P: -4, R: -2, G: 0 };
        this.aiTable4C = { P: -5, R: 0, G: 1 };
        this.aiTable1D = { P: -5, R: 0, G: 2 };
        this.aiTable2D = { P: -6, R: 0, G: 2 };
        this.aiTable3D = { P: -7, R: 0, G: 3};
        this.aiTable4D = { P: -8, R: 0, G: 5};



    }

    increaseLevel(board) {
        if (board.level < this.maxLevel) {
            board.level++;
        }
    }
    decreaseLevel(board) {
        if (board.level > 1) {
            board.level = board.level - 1;
        }
    }
    checkWinner(board,depth) {
        if (depth >= this.maxDepth) { //it is in a loop
            return board.points;
        } else {
            if (board.points >= this.maxPossiblePoints) {
                return board.points;
            } else if (board.points <= this.minPossiblePoints) {
                return board.points;
            }
            else {
                return null; //no winner yet
            }
        }

    }

    minimax(board_in, possible_move, previous_move, depth, isMax, parent_node) {
        var resultWinner = this.checkWinner(board_in, depth);
        if (depth > this.extreme) {
            this.extreme = depth;
        }
        if (resultWinner !== null) { //if there is a winner already
            return resultWinner;
        }

        if (isMax) { //AI's turn
            var bestScore = Number.NEGATIVE_INFINITY;
            var move;
            this.modifyBoard(board_in, possible_move, previous_move, true); //update the clone of board with the last potencial movement of Human
            for (var i = 0; i < this.possibleMovesAI.length; i++) {
                var newNode = {
                    parent: parent_node,
                    text: { name: "aux" }
                };

                var backupBoard = { level: board_in.level, points: board_in.points };
                var score = this.minimax(backupBoard, this.possibleMovesAI[i], possible_move, depth + 1, false, newNode); //next one is going to try to minimize

                newNode.text = { name: "AI. v=" + this.possibleMovesAI[i] + " s=" + score }
                this.allNodes.push(newNode);
                if (score > bestScore) {
                    bestScore = score;
                    move = this.possibleMovesAI[i];
                }
            }
            return bestScore;
        } else { //Human's turn
            var bestScore = Number.POSITIVE_INFINITY;
            var move;
            this.modifyBoard(board_in, possible_move, previous_move, false); //update the clone of board with the last potencial movement of AI
            for (var i = 0; i < this.possibleMovesHuman.length; i++) {
                var newNode = {
                    parent: parent_node,
                    text: { name: "aux" }
                };

                var backupBoard = { level: board_in.level, points: board_in.points };
                var score = this.minimax(backupBoard, this.possibleMovesHuman[i], possible_move, depth + 1, true, newNode); //next one is going to try to maximize

                newNode.text = { name: "H. v=" + this.possibleMovesHuman[i] + " s=" + score }
                this.allNodes.push(newNode);
                if (score < bestScore) {
                    bestScore = score;
                    move = this.possibleMovesHuman[i];
                }
            }
            return bestScore;
        }
    }

    modifyBoard(board, move, previous_move, isHuman) {
        if (isHuman) {
            //board.addPoints(humanTable1[move]);
            board.points = board.points + this.humanTable1[move];
        } else {
            if(move.localeCompare("P") == 0){ //evaluate AI mov and update levels  ***THINK
                this.increaseLevel(board);
            }else if (move.localeCompare("G") == 0){
               this.decreaseLevel(board);
            }

            if (previous_move.localeCompare("A") == 0) {
                if (board.level == 1) {
                    board.points = board.points + this.aiTable1A[move];
                } else if (board.level == 2) {
                    board.points = board.points + this.aiTable2A[move];
                } else if (board.level == 3) {
                    board.points = board.points + this.aiTable3A[move];
                } else if (board.level == 4) {
                    board.points = board.points + this.aiTable4A[move];
                }
            }else if (previous_move.localeCompare("B") == 0) {
                if (board.level== 1) {
                    board.points = board.points + this.aiTable1B[move];
                } else if (board.level == 2) {
                    board.points = board.points+ this.aiTable2B[move];
                } else if (board.level == 3) {
                    board.points = board.points + this.aiTable3B[move];
                } else if (board.level == 4) {
                    board.points = board.points + this.aiTable4B[move];
                }
            } else if (previous_move.localeCompare("C") == 0) {
                if (board.level == 1) {
                    board.points = board.points + this.aiTable1C[move];
                } else if (board.level == 2) {
                    board.points = board.points + this.aiTable2C[move];
                } else if (board.level == 3) {
                    board.points = board.points + this.aiTable3C[move];
                } else if (board.level == 4) {
                    board.points = board.points + this.aiTable4C[move];
                }
            } else if (previous_move.localeCompare("D") == 0) {
                if (board.level == 1) {
                    board.points = board.points + this.aiTable1D[move];
                } else if (board.level == 2) {
                    board.points = board.points + this.aiTable2D[move];
                } else if (board.level == 3) {
                    board.points = board.points + this.aiTable3D[move];
                } else if (board.level == 4) {
                    board.points = board.points + this.aiTable4D[move];
                }
            }
        }
    }

    bestMove(human_move) { //get the best move in response to the last move
        var bestScore = Number.NEGATIVE_INFINITY;
        var move;
        var config = {
            container: "#tree-simple"
        };
        var parent_node = {
            text: { name: "H. v=" + human_move }
        };
        this.allNodes.push(config);
        this.allNodes.push(parent_node);   
        this.modifyBoard(this.myBoard, human_move, null, true); //update the board with the last movement of Human
        for (var i = 0; i < this.possibleMovesAI.length; i++) {
            var backupBoard = { level: this.myBoard.level, points: this.myBoard.points }; //the clone of the board is used in order to avoid modifications to the original one
            var newNode = {
                parent: parent_node,
                text: { name: "aux"}
            };
            var score = this.minimax(backupBoard, this.possibleMovesAI[i], human_move, 0, false, newNode); //the next is going to try to minimize

            newNode.text = { name: "AI. v=" + this.possibleMovesAI[i] + " s=" + score }
            this.allNodes.push(newNode);
            if (score > bestScore) {
                bestScore = score;
                move = this.possibleMovesAI[i];
            }
        }
        this.modifyBoard(this.myBoard, move, human_move, false); //update the board with the last REAL movement of AI
      
        alert("Move = " + move + "; level = " + this.myBoard.level + "; points = " + this.myBoard.points);

        if(this.myBoard.points >= this.maxPossiblePoints){
            this.game.setWinner(true, this.myBoard.level);
        }else if(this.myBoard.points <= this.minPossiblePoints){
            this.game.setWinner(false, this.myBoard.level);
        }else{
            this.game.setLevel(this.myBoard.level, this.myBoard.points);
            new Treant(this.allNodes);
        } 
        this.game.showCurrentStatus();
    }

    set_human_answer(human_move){
       // alert("THIS IS ALGORITHM " +human_move);
       this.allNodes = new Array();
       this.bestMove(human_move);
    }

   



}