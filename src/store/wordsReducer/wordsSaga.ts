import { PayloadAction, createAction } from '@reduxjs/toolkit';
import { select, put, takeEvery, call } from 'redux-saga/effects';
import { FilterWordsType, WordsItem } from '../../types';
import { getAllWordsListInDBSelector, restWordsList } from './wordsSlice';
import {
    SettingState,
    getSettingSelector,
} from '../settingReducer/settingSlice';
import { shuffleArray } from '../../utils';

// actions
export const WORDS_SAGA = {
    FILTER_WORDS: 'FILTER_WORDS',
    RESET_ORIGINAL_WORDS: 'RESET_ORIGINAL_WORDS',
    RESET_WORDS: 'RESET_WORDS',
};

export const filterWords = createAction(
    WORDS_SAGA.FILTER_WORDS,
    (f: FilterWordsType) => ({ payload: f }),
);

// TODO: filter Words by recent time.
export function* filterWordsSaga(action: PayloadAction<FilterWordsType>) {
    const originalWordsList = yield select(getAllWordsListInDBSelector);
    const { startRange, endRange, familiarFilter } = action.payload;
    const rangeWords = originalWordsList.slice(startRange, endRange);
    const filterWords = rangeWords.filter((r: WordsItem) =>
        familiarFilter === 'only_unfamiliar'
            ? !r.familiar
            : familiarFilter === 'only_familiar'
            ? r.familiar
            : true,
    );
    yield call(resetWordsSaga, filterWords);
}

export function* resetOriginalWordsSaga() {
    const originalWordsList = yield select(getAllWordsListInDBSelector);
    yield call(resetWordsSaga, originalWordsList);
}

export function* resetWordsSaga(action: PayloadAction<WordsItem[]>) {
    const words = action.payload;
    const settingConfig = yield select(getSettingSelector);
    const newRangeWords = (settingConfig as SettingState).randomOrder
        ? shuffleArray(words)
        : words;
    yield put(restWordsList(newRangeWords));
}

export function* watchWordsSaga() {
    yield takeEvery(WORDS_SAGA.FILTER_WORDS, filterWordsSaga);
    yield takeEvery(WORDS_SAGA.RESET_ORIGINAL_WORDS, resetOriginalWordsSaga);
    yield takeEvery(WORDS_SAGA.RESET_WORDS, resetWordsSaga);
}