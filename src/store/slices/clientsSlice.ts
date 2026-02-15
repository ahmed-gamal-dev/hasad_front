import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Client } from '@/types/client';

interface ClientsState {
  clients: Client[];
}

const initialState: ClientsState = {
  clients: [],
};

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setClients: (state, action: PayloadAction<Client[]>) => {
      state.clients = action.payload;
    },
    clearClients: (state) => {
      state.clients = [];
    },
  },
});

export const { setClients, clearClients } = clientsSlice.actions;
export default clientsSlice.reducer;

