using System;
using System.IO;

public class SoundtrackGenerator
{
    const int SR = 44100;
    const double BPM = 118.0;
    const double BEAT_SEC = 60.0 / BPM;
    const int BEAT_SMP = (int)(SR * BEAT_SEC);

    static Random rnd = new Random(42);

    public static void Main()
    {
        double totalSec = 157.0;
        int totalSmp = (int)(SR * totalSec);
        float[] buf = new float[totalSmp];

        Console.Write("Generating layers...");

        PadLayer(buf, 0, totalSec, new double[] { 146.83, 174.61, 220.00 }, 0.10);
        Console.Write(" pad");
        PadLayer(buf, 0, totalSec, new double[] { 293.66, 349.23, 440.00 }, 0.05);
        Console.Write(" pad2");

        PadLayer(buf, 20, 55, new double[] { 587.33, 698.46, 880.00, 1046.50 }, 0.04);
        Console.Write(" high-pad");

        PadLayer(buf, 70, 110, new double[] { 392.00, 466.16, 523.25, 587.33 }, 0.08);
        Console.Write(" strings");
        PadLayer(buf, 85, 105, new double[] { 261.63, 329.63, 392.00, 440.00, 523.25 }, 0.05);
        Console.Write(" brass");

        PadLayer(buf, 100, totalSec, new double[] { 146.83, 174.61, 220.00, 261.63 }, 0.05);
        Console.Write(" res-pad");
        PadLayer(buf, 140, totalSec - 2, new double[] { 293.66, 349.23, 440.00, 523.25 }, 0.07);
        Console.Write(" final");

        BassLine(buf, 10, totalSec, 0.18);
        Console.Write(" bass");

        Percussion(buf, 15, 147, 0.12);
        Console.Write(" drums");

        Arpeggio(buf, 40, 105, 0.05);
        Console.Write(" arp");

        int fadeLen = SR * 2;
        for (int i = 0; i < buf.Length && i < fadeLen; i++)
            buf[i] *= (float)i / fadeLen;
        for (int i = Math.Max(0, buf.Length - fadeLen); i < buf.Length; i++)
            buf[i] *= (float)(buf.Length - i) / fadeLen;

        float peak = 0;
        for (int i = 0; i < buf.Length; i++)
            peak = Math.Max(peak, Math.Abs(buf[i]));
        float gain = peak > 0 ? 0.95f / peak : 0;
        for (int i = 0; i < buf.Length; i++)
            buf[i] *= gain;

        short[] data = new short[buf.Length];
        for (int i = 0; i < buf.Length; i++)
            data[i] = (short)(buf[i] * 32767);
        Console.WriteLine();

        WriteWav(data, "public/soundtrack.wav");
        Console.WriteLine(string.Format("Generated {0} samples, {1:F2}s", data.Length, data.Length / (double)SR));
    }

    static double Osc(double t, double f, int shape)
    {
        double phase = f * t - Math.Floor(f * t);
        switch (shape)
        {
            case 0: return Math.Sin(2 * Math.PI * f * t);
            case 1: return phase < 0.5 ? 1.0 : -1.0;
            case 2: return 2.0 * phase - 1.0;
            default: return Math.Sin(2 * Math.PI * f * t);
        }
    }

    static void PadLayer(float[] buf, double startSec, double endSec, double[] freqs, double vol)
    {
        int s = Math.Max(0, (int)(startSec * SR));
        int e = Math.Min(buf.Length, (int)(endSec * SR));
        double totalDur = endSec - startSec;

        for (int i = s; i < e; i++)
        {
            double t = (double)i / SR;
            double tl = t - startSec;
            double env = 1.0;
            if (tl < 3.0) env = tl / 3.0;
            if (totalDur - tl < 3.0) env *= (totalDur - tl) / 3.0;

            double smp = 0;
            for (int fi = 0; fi < freqs.Length; fi++)
            {
                double f = freqs[fi];
                smp += Math.Sin(2 * Math.PI * f * t) * 0.5;
                smp += Math.Sin(2 * Math.PI * f * 2.003 * t) * 0.2;
                smp += Math.Sin(2 * Math.PI * f * 0.501 * t) * 0.15;
                smp += Math.Sin(2 * Math.PI * f * 3.007 * t) * 0.1;
            }
            smp /= freqs.Length;
            smp *= env * vol;
            buf[i] += (float)smp;
        }
    }

    static void BassLine(float[] buf, double startSec, double endSec, double vol)
    {
        double[] roots = { 146.83, 146.83, 146.83, 146.83, 110.00, 110.00, 146.83, 146.83, 174.61, 196.00, 110.00, 110.00 };
        int patBeats = roots.Length;

        int s = Math.Max(0, (int)(startSec * SR));
        int e = Math.Min(buf.Length, (int)(endSec * SR));

        for (int i = s; i < e; i++)
        {
            double t = (double)i / SR;
            double tl = t - startSec;
            int beatIdx = (int)(tl / BEAT_SEC) % patBeats;
            double f = roots[beatIdx];
            double phaseInBeat = (tl / BEAT_SEC) % 1.0;
            double amp = 1.0 - phaseInBeat * 0.3;
            if (tl < 2.0) amp *= tl / 2.0;

            double smp = Math.Sin(2 * Math.PI * f * t) * 0.5
                       + Math.Sin(2 * Math.PI * f * 2.01 * t) * 0.2
                       + Math.Sin(2 * Math.PI * f * 3.02 * t) * 0.1;
            smp *= amp * vol;
            buf[i] += (float)smp;
        }
    }

    static void Percussion(float[] buf, double startSec, double endSec, double vol)
    {
        for (double beat = 0; ; beat += 0.5)
        {
            double time = startSec + beat * BEAT_SEC;
            if (time >= endSec) break;
            int pos = (int)(time * SR);
            if (pos >= buf.Length) break;

            int intBeat = (int)beat;
            bool isKick = intBeat % 2 == 0;
            bool isSnare = intBeat % 4 == 3;
            bool isHat = true;

            if (isKick && pos < buf.Length)
            {
                int dur = (int)(0.12 * SR);
                for (int j = 0; j < dur && pos + j < buf.Length; j++)
                {
                    double tj = (double)j / SR;
                    double env = Math.Exp(-tj * 30);
                    double freq = 80 - tj * 400;
                    if (freq < 30) freq = 30;
                    double s = Math.Sin(2 * Math.PI * freq * tj);
                    buf[pos + j] += (float)(s * env * 0.25 * vol);
                }
            }

            if (isSnare && pos < buf.Length)
            {
                int dur = (int)(0.08 * SR);
                for (int j = 0; j < dur && pos + j < buf.Length; j++)
                {
                    double tj = (double)j / SR;
                    double env = Math.Exp(-tj * 35);
                    double noise = rnd.NextDouble() * 2 - 1;
                    double tone = Math.Sin(2 * Math.PI * 180 * tj);
                    double s = noise * 0.7 + tone * 0.3;
                    buf[pos + j] += (float)(s * env * 0.18 * vol);
                }
            }

            if (isHat && pos < buf.Length)
            {
                int dur = (int)(0.03 * SR);
                for (int j = 0; j < dur && pos + j < buf.Length; j++)
                {
                    double tj = (double)j / SR;
                    double env = Math.Exp(-tj * 100);
                    double noise = rnd.NextDouble() * 2 - 1;
                    double s = noise * 0.5 + Math.Sin(2 * Math.PI * 8000 * tj) * 0.5;
                    buf[pos + j] += (float)(s * env * 0.10 * vol);
                }
            }
        }
    }

    static void Arpeggio(float[] buf, double startSec, double endSec, double vol)
    {
        double[] notes = { 293.66, 349.23, 440.00, 523.25, 440.00, 349.23 };
        double noteLen = BEAT_SEC / 2;

        int s = Math.Max(0, (int)(startSec * SR));
        int e = Math.Min(buf.Length, (int)(endSec * SR));

        for (int i = s; i < e; i++)
        {
            double t = (double)i / SR;
            double tl = t - startSec;
            int noteIdx = (int)(tl / noteLen) % notes.Length;
            double f = notes[noteIdx];

            double env = 1.0;
            if (tl < 2.0) env = tl / 2.0;
            double dur = endSec - startSec;
            if (dur - tl < 2.0) env *= (dur - tl) / 2.0;

            double notePhase = (tl / noteLen) % 1.0;
            double noteEnv = Math.Exp(-notePhase * 4);

            double snd = Math.Sin(2 * Math.PI * f * t) * 0.6
                       + Math.Sin(2 * Math.PI * f * 3.01 * t) * 0.2;
            snd *= env * noteEnv * vol;
            buf[i] += (float)snd;
        }
    }

    static void WriteWav(short[] data, string path)
    {
        using (var fs = new FileStream(path, FileMode.Create))
        using (var bw = new BinaryWriter(fs))
        {
            int dataSize = data.Length * 2;
            int fileSize = 36 + dataSize;

            bw.Write(new char[] { 'R', 'I', 'F', 'F' });
            bw.Write(fileSize);
            bw.Write(new char[] { 'W', 'A', 'V', 'E' });
            bw.Write(new char[] { 'f', 'm', 't', ' ' });
            bw.Write(16);
            bw.Write((short)1);
            bw.Write((short)1);
            bw.Write(SR);
            bw.Write(SR * 2);
            bw.Write((short)2);
            bw.Write((short)16);
            bw.Write(new char[] { 'd', 'a', 't', 'a' });
            bw.Write(dataSize);

            foreach (short s in data)
                bw.Write(s);
        }
    }
}
