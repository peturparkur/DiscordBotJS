class Game {
}
class TicTacToe extends Game {
    constructor(rows = 3, columns = 3) {
        super();
        this.rows = 3;
        this.columns = 3;
        this.rows = rows;
        this.columns = columns;
        this.grid = new Array(rows * columns);
    }
    val(i, j) {
        return this.grid[this.columns * i + j];
    }
    setVal(val, i, j) {
        this.grid[this.columns * i + j] = val;
    }
    action(player, i, j) {
        this.setVal(player, i, j);
    }
    GetState() {
        return {
            'state': this.grid
        };
    }
}
export { Game, TicTacToe };
