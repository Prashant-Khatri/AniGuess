import {Schema, model} from 'mongoose'

export interface ICharacter{
    characterName : string;
    animeNameEnglish : string;
    alternateName : string[];
    imageUrl : string;
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


