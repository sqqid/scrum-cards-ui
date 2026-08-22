import scrumCardsApi from "../../../../services/scrum-cards-api";

const pickerCardActions = {
  pickCard: (roomId: string, clientId: string, score: string, onError?: (error: Error) => void) => {
    scrumCardsApi.addScore(roomId, clientId, score).subscribe({
      next: () => null,
      error: (err: Error) => {
        console.error("Failed to pick card:", err);
        onError?.(err);
      },
    });
  },

  removeCard: (roomId: string, clientId: string, onError?: (error: Error) => void) => {
    scrumCardsApi.removeScore(roomId, clientId).subscribe({
      next: () => null,
      error: (err: Error) => {
        console.error("Failed to remove card:", err);
        onError?.(err);
      },
    });
  },
};

export { pickerCardActions };
