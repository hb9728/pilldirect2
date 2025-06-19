export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { submission } = req.body

  const prompt = `
Generate a concise pharmacist-style summary for a contraceptive consultation:
- Patient: ${submission.firstName} ${submission.lastName}, DOB: ${submission.dob}
- Pill Choice: ${submission.pillChoice}
- Medical History: ${Array.isArray(submission.selectApplicable) ? submission.selectApplicable.join(', ') : 'None'}
- Extra Meds: ${submission.extraMeds || 'None'}
- BP: ${submission.bpSystolic}/${submission.bpDiastolic}
- Height: ${submission.heightFt || submission.heightCm}, Weight: ${submission.weightSt || submission.weightKg}
- Notes should summarize suitability for contraception and highlight any flags.

Respond with only the summary text.`

  // 🔍 Debug logs
  console.log('Calling Hugging Face API...')
  console.log('Prompt:', prompt)
  console.log('HF_API_KEY:', process.env.HF_API_KEY ? 'Exists' : 'Missing')

  const llamaResponse = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2", {
    headers: {
      Authorization: `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json"
    },
    method: "POST",
    body: JSON.stringify({ inputs: prompt })
  })

  const raw = await llamaResponse.text()
  console.log('Raw HF response:', raw)

  let data
  try {
    data = JSON.parse(raw)
  } catch (err) {
    console.error('❌ Failed to parse HF response:', err)
    return res.status(500).json({ error: 'Bad response from Hugging Face' })
  }

  if (data.error) {
    console.error('❌ HF API Error:', data.error)
    return res.status(500).json({ error: data.error })
  }

  return res.status(200).json({ note: data.generated_text || data[0]?.generated_text })
}
