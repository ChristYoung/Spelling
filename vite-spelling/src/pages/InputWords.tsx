import { TextareaAutosize as BaseTextareaAutosize } from '@mui/base/TextareaAutosize';
import { styled } from '@mui/system';
import React, { useRef, useState } from 'react';
import { useIndexedDB } from 'react-indexed-db-hook';
import { DB_WORDS_TABLE_NAME } from '../DB/db.enum';
import LoadingButton from '@mui/lab/LoadingButton';
import {
    OutputYouDaoBaseResponse,
    OutputYouDaoExplanationData,
    WordsItem,
} from '../types';
import { getDateString, fetchRequest } from '../utils';
import { WORDS_EXPLANATION } from '../enum';
// import Typo from 'typo-js';

// const dictionary = new Typo('en_US');

export const InputWords: React.FC = () => {
    const { add } = useIndexedDB(DB_WORDS_TABLE_NAME.WORDS);
    const value = useRef<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const onSubmitWords = async () => {
        setLoading(true);
        const words = value.current.trim().split('\n');
        if (!value.current) {
            setLoading(false);
            return;
        }

        // TODO: 验证单词拼写是否正确.

        const wordsToAdd: WordsItem[] = words.map(word => {
            return {
                word,
                created_timestamp: 0,
                familiar: false,
            };
        });

        for (const w of wordsToAdd) {
            // 调用有道api获取单词的释义, 存入到数据库中.
            const explanationsResponse = await fetchRequest<
                OutputYouDaoBaseResponse<OutputYouDaoExplanationData>
            >({
                url: `${WORDS_EXPLANATION}${w.word}`,
            });
            const explanations = explanationsResponse?.data?.entries.map(
                e => e.explain,
            );
            w.explanations = explanations;
        }
        for (const word of wordsToAdd) {
            word.created_timestamp = getDateString();
            await add(word);
        }
        setLoading(false);
    };
    return (
        <div className="__InputWords text-6xl text-slate-600">
            <h3 className="dark:text-white mb-10">
                Please Input the words that you want to review later.
            </h3>
            <TextareaAutosize
                minRows={10}
                onChange={e => {
                    value.current = e.target.value;
                }}
                aria-label="empty textarea"
                placeholder="Any Words"
            />
            <div>
                <LoadingButton
                    loading={loading}
                    size="large"
                    variant="contained"
                    onClick={onSubmitWords}>
                    Save
                </LoadingButton>
            </div>
        </div>
    );
};

const blue = {
    100: '#DAECFF',
    200: '#b6daff',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E5',
    900: '#003A75',
};

const grey = {
    50: '#f6f8fa',
    100: '#eaeef2',
    200: '#d0d7de',
    300: '#afb8c1',
    400: '#8c959f',
    500: '#6e7781',
    600: '#57606a',
    700: '#424a53',
    800: '#32383f',
    900: '#24292f',
};

const TextareaAutosize = styled(BaseTextareaAutosize)(
    ({ theme }) => `
    width: 520px;
    font-family: IBM Plex Sans, sans-serif;
    font-size: 1.875rem;
    font-weight: 400;
    line-height: 1.5;
    padding: 12px;
    border-radius: 12px 12px 0 12px;
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    box-shadow: 0px 2px 24px ${
        theme.palette.mode === 'dark' ? blue[900] : blue[100]
    };
  
    &:hover {
      border-color: ${blue[400]};
    }
  
    &:focus {
      border-color: ${blue[400]};
      box-shadow: 0 0 0 3px ${
          theme.palette.mode === 'dark' ? blue[600] : blue[200]
      };
    }
  
    // firefox
    &:focus-visible {
      outline: 0;
    }
  `,
);
