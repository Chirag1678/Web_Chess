const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";
  board.forEach((row, rowindex) => {
    row.forEach((square, sqaureindex) => {
      const squareElement = document.createElement("div");
      
      if(playerRole==="b"){
        squareElement.classList.add(
            "square",
            "flex","items-center","justify-center","text-3xl",
            (rowindex + sqaureindex) % 2 === 0 ? "bg-amber-200" : "bg-amber-800",
            "h-12","w-12",
            "rotate-180"
          );
      }
      else{
        squareElement.classList.add(
            "square",
            "flex","items-center","justify-center","text-3xl",
            (rowindex + sqaureindex) % 2 === 0 ? "bg-amber-200" : "bg-amber-800",
            "h-12","w-12"
          );
      }

      squareElement.dataset.row = rowindex;
      squareElement.dataset.col = sqaureindex;

      if (square) {
        const pieceElement = document.createElement("div");
        pieceElement.classList.add(
          "piece",
          square.color === "w" ? "text-white" : "text-black"
        );
        pieceElement.innerText=getPieceUnicode(square);
        pieceElement.draggable= playerRole===square.color;
        pieceElement.addEventListener("dragstart", (e) => {
            if(pieceElement.draggable){
                draggedPiece=pieceElement;
                sourceSquare={row:rowindex,col:sqaureindex};
                e.dataTransfer.setData("text/plain","");
                e.dataTransfer.effectAllowed = "move";
            }
        });
        pieceElement.addEventListener("dragend",(e)=>{
            draggedPiece=null;
            sourceSquare=null;
        });
        squareElement.appendChild(pieceElement);
      }

      squareElement.addEventListener("dragover",(e)=>{
        e.preventDefault();
      });
      squareElement.addEventListener("drop",(e)=>{
        e.preventDefault();
        if(draggedPiece){
            const targetSource={
                row:parseInt(squareElement.dataset.row),
                col:parseInt(squareElement.dataset.col),
            }
            handleMove(sourceSquare,targetSource);
        }
      });
      boardElement.appendChild(squareElement);
    });
  });
  if(playerRole==="b"){
    boardElement.classList.add("rotate-180");
  }
  else{
    boardElement.classList.remove("rotate-180");
  }
};

const handleMove = (source,tagret) => {
    const move={
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+tagret.col)}${8-tagret.row}` ,
        promotion:"q"
    }
    socket.emit("move",move);
};

const getPieceUnicode = (piece) => {
   const unicodePieces={
    p:"♙",
    r:"♜",
    n:"♞",
    b:"♝",
    q:"♛",
    k:"♚",
    P:"♙",
    R:"♖",
    N:"♘",
    B:"♗",
    Q:"♕",
    K:"♔"
   }
   return unicodePieces[piece.type] || "";
};

socket.on("playerRole",(role)=>{
    playerRole=role;
    renderBoard();
});

socket.on("spectatorRole",()=>{
    playerRole=null;
    renderBoard();
});

socket.on("boardState",(fen)=>{
    chess.load(fen);
    renderBoard();
});

socket.on("move",(move)=>{
    chess.move(move);
    renderBoard();
});
renderBoard();