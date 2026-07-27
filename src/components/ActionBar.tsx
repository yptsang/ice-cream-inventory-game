interface ActionBarProps {
  isCompleted: boolean;
  onAdvance: () => void;
  onNewGame: () => void;
}

export const ActionBar = ({ isCompleted, onAdvance, onNewGame }: ActionBarProps) => (
  <nav aria-label="Game actions" className="action-bar">
    <button className="secondary-button" type="button" onClick={onNewGame}>
      New Game
    </button>
    <button className="primary-button" disabled={isCompleted} type="button" onClick={onAdvance}>
      {isCompleted ? 'Run Complete' : 'Next Day'}
    </button>
  </nav>
);
