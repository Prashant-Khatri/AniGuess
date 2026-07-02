import {Schema,Document, model} from 'mongoose'

export interface ICharacter extends Document {
    characterName : string;
    animeNameEnglish : string;
    alternateName : string[];
    imageUrl : string;
    difficulty : 'easy' | 'medium' | 'hard';
    hints : {
        hard : string;
        medium : string;
        easy : string;
    };
}

const characterSchema=new Schema<ICharacter>({
    characterName : {
        type : String,
        required : true
    },
    animeNameEnglish : {
        type : String,
        required : true
    },
    alternateName :{
        type : [String],
    },
    imageUrl : {
        type : String,
        required : true
    },
    difficulty : {
        type : String,
        enum : ['easy','medium','hard']
    },
    hints : {
        hard : {
            type : String,
            required : true
        },
        medium : {
            type : String,
            required : true
        },
        easy : {
            type : String,
            required : true
        }
    }
},{timestamps : true})

export const Character=model<ICharacter>('Character',characterSchema)

//data : name,avatar,rounds (frontend)