import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { code, language } = await req.json()

    if (!code) {
      return Response.json({ error: "Code is required" }, { status: 400 })
    }

    // Generate analysis using AI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
        Analyze the following ${language} code:
        
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Provide a detailed analysis in JSON format with the following structure:
        {
          "summary": "Brief overview of what the code does",
          "functions": [
            {
              "name": "functionName",
              "explanation": "What this function does",
              "parameters": ["param1 - description", "param2 - description"],
              "returns": "What the function returns"
            }
          ],
          "variables": [
            {
              "name": "variableName",
              "type": "dataType",
              "purpose": "What this variable is used for"
            }
          ],
          "bugs": [
            {
              "type": "error|warning|suggestion",
              "message": "Description of the issue",
              "line": 3,
              "suggestion": "How to fix it"
            }
          ]
        }
        
        Only return valid JSON that matches this structure exactly.
      `,
    })

    // Parse the response as JSON
    try {
      const analysis = JSON.parse(text)
      return Response.json(analysis)
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", error)
      return Response.json(
        {
          error: "Failed to parse analysis results",
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error analyzing code:", error)
    return Response.json(
      {
        error: "An error occurred while analyzing the code",
      },
      { status: 500 },
    )
  }
}

