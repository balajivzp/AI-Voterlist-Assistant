
import { GoogleGenAI, Type } from "@google/genai";
import type { ExtractedData, Voter } from '../types';

const PROMPT = `
You are an expert data extraction AI. Your task is to analyze the provided document (image or PDF page) of a Tamil Nadu, India voter list and extract all relevant information into a structured JSON format.

Follow these instructions carefully:
1.  Analyze the entire document page to identify all sections: Constituency details, polling station details, voter statistics, and the list of individual voters.
2.  Extract the data precisely as it appears, including names, numbers, and addresses.
3.  For each voter, determine the relation type (father or husband) based on the label ('தந்தையின் பெயர்' for father, 'கணவர் பெயர்' for husband).
4.  Map the gender ('பாலினம்') to 'male' for 'ஆண்' and 'female' for 'பெண்'.
5.  Adhere strictly to the provided JSON schema. Do not add or remove fields. Ensure all data types match the schema (e.g., numbers for age, part number, etc.).
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        constituencyInfo: {
            type: Type.OBJECT,
            properties: {
                assembly: {
                    type: Type.OBJECT,
                    properties: {
                        number: { type: Type.INTEGER },
                        name: { type: Type.STRING },
                        category: { type: Type.STRING }
                    },
                    required: ["number", "name", "category"]
                },
                parliamentary: {
                    type: Type.OBJECT,
                    properties: {
                        number: { type: Type.INTEGER },
                        name: { type: Type.STRING },
                        category: { type: Type.STRING }
                    },
                     required: ["number", "name", "category"]
                },
            },
            required: ["assembly", "parliamentary"]
        },
        pollingStationInfo: {
            type: Type.OBJECT,
            properties: {
                partNumber: { type: Type.INTEGER },
                name: { type: Type.STRING },
                address: { type: Type.STRING },
                mainTownOrVillage: { type: Type.STRING },
                policeStation: { type: Type.STRING },
                district: { type: Type.STRING },
                pinCode: { type: Type.STRING }
            },
            required: ["partNumber", "name", "address", "mainTownOrVillage", "policeStation", "district", "pinCode"]
        },
        voterStats: {
            type: Type.OBJECT,
            properties: {
                startingSerialNumber: { type: Type.INTEGER },
                endingSerialNumber: { type: Type.INTEGER },
                maleVoters: { type: Type.INTEGER },
                femaleVoters: { type: Type.INTEGER },
                thirdGenderVoters: { type: Type.INTEGER },
                totalVoters: { type: Type.INTEGER }
            },
            required: ["startingSerialNumber", "endingSerialNumber", "maleVoters", "femaleVoters", "thirdGenderVoters", "totalVoters"]
        },
        voters: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    serialNumber: { type: Type.STRING },
                    voterId: { type: Type.STRING, description: "Extract the ID number like WTD0416438" },
                    name: { type: Type.STRING },
                    relationName: { type: Type.STRING },
                    relationType: { type: Type.STRING, enum: ["father", "husband", "mother", "other"] },
                    houseNumber: { type: Type.STRING },
                    age: { type: Type.INTEGER },
                    gender: { type: Type.STRING, enum: ["male", "female", "other"] },
                },
                required: ["serialNumber", "voterId", "name", "relationName", "relationType", "houseNumber", "age", "gender"]
            }
        }
    },
    required: ["constituencyInfo", "pollingStationInfo", "voterStats", "voters"]
};


export const extractVoterInfo = async (base64FileData: string, mimeType: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const filePart = {
            inlineData: {
                data: base64FileData,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: PROMPT,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, filePart] },
            config: {
              responseMimeType: "application/json",
              responseSchema: responseSchema,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Gemini API request failed.");
    }
};

const chatResponseSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { 
      type: Type.STRING,
      description: "A conversational, text-based answer to the user's question. This should always be populated."
    },
    voters: {
      type: Type.ARRAY,
      description: "A list of voters that match the user's query. Only populate this if the query is asking to find specific voters.",
      items: {
        type: Type.OBJECT,
        properties: {
            serialNumber: { type: Type.STRING },
            voterId: { type: Type.STRING },
            name: { type: Type.STRING },
            relationName: { type: Type.STRING },
            relationType: { type: Type.STRING, enum: ["father", "husband", "mother", "other"] },
            houseNumber: { type: Type.STRING },
            age: { type: Type.INTEGER },
            gender: { type: Type.STRING, enum: ["male", "female", "other"] },
        },
        required: ["serialNumber", "voterId", "name", "relationName", "relationType", "houseNumber", "age", "gender"]
      }
    }
  },
  required: ["summary"]
};

const CHAT_PROMPT = `You are a helpful AI assistant for an election booth agent. Your task is to answer questions about a specific voter list. 
You will be provided with the complete voter list data in JSON format.
Your answers must be based *only* on the provided data. Do not use any external knowledge.
If the question cannot be answered from the data, clearly state that in the summary.

Respond in JSON format according to the provided schema.
- The 'summary' field should contain a conversational answer to the user's question.
- If the user's query can be answered by listing one or more specific voters (e.g., "who lives at house 123?", "find voter ID XYZ"), populate the 'voters' array with the full details of those voters from the provided data.
- If the user's question is more general (e.g., "how many voters are there?", "what is the polling station address?"), leave the 'voters' array empty or undefined.

Here is the voter data:
`;

export const answerVoterQuestion = async (
  query: string,
  voterData: ExtractedData
): Promise<{ text: string; voters?: Voter[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const fullPrompt = `${CHAT_PROMPT}\n\n${JSON.stringify(voterData, null, 2)}\n\nUser Question: ${query}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: chatResponseSchema,
      }
    });

    const parsedResult = JSON.parse(response.text);

    return {
        text: parsedResult.summary,
        voters: parsedResult.voters && parsedResult.voters.length > 0 ? parsedResult.voters : undefined
    };

  } catch (error) {
    console.error("Error calling Gemini API for chat:", error);
    return { text: "Sorry, I encountered an error while processing your request. Please try again." };
  }
};
