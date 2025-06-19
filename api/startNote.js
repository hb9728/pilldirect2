export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { submission } = req.body;

  const prompt = `
Generate a clinical summary in 2–4 bullet points for a pharmacist:
- Patient: ${submission.firstName} ${submission.lastName}, DOB: ${submission.dob}
- Pill Choice: ${submission.pillChoice}
- Medical History: ${Array.isArray(submission.selectApplicable) ? submission.selectApplicable.join(', ') : 'None'}
- Extra Meds: ${submission.extraMeds || 'None'}
- BP: ${submission.bpSystolic}/${submission.bpDiastolic}
- Height: ${submission.heightFt || submission.heightCm}, Weight: ${submission.weightSt || submission.weightKg}
`;

  try {
    const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "db21e45e230c8cf3c519942df8eefc8ee600e1f7c5f8708ad4eecc3fd4effc31",
        input: {
          prompt,
          max_new_tokens: 200,
          temperature: 0.7
        }
      })
    });

    const prediction = await replicateRes.json();

    if (prediction.id) {
      return res.status(200).json({ id: prediction.id });
    } else {
      return res.status(500).json({ error: prediction.error || 'Failed to start prediction' });
    }
  } catch (err) {
    console.error('Replicate init error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
