import {Schema,Document, model} from 'mongoose'

export interface ICharacter extends Document {
    characterName : string;
    animeNameEnglish : string;
    alternateName : string[];
    imageUrl : string;
    difficulty : 'easy' | 'medium' | 'hard';
    hint1 : string;
    hint2 : string;
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
    hint1 : {
        type : String,
        required :true
    },
    hint2 : {
        type : String,
        required : true
    }
},{timestamps : true})

export const Character=model<ICharacter>('Character',characterSchema)

//data : name,avatar,rounds (frontend)


