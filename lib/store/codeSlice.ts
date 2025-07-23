import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CodeState {
  code: string;
}

const initialState: CodeState = {
  code: '',
};

const codeSlice = createSlice({
  name: 'code',
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
  },
});

export const { setCode } = codeSlice.actions;
export default codeSlice.reducer;
