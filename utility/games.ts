class Game {

}

class TicTacToe extends Game {

    rows : number = 3
    columns : number = 3
    grid : Array<number>;
    
    constructor(rows = 3, columns = 3){
        super();
        this.rows = rows;
        this.columns = columns;
        this.grid = new Array<number>(rows * columns);
    }

    val(i : number, j : number){
        return this.grid[this.columns * i + j]
    }

    setVal(val : number, i : number, j : number){
        this.grid[this.columns * i + j] = val;
    }

    action(player : number, i : number, j : number){
        this.setVal(player, i, j);
    }

    GetState(){
        return {
            'state' : this.grid
        }
    }
}

export {Game, TicTacToe}