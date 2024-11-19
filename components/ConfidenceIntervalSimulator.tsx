import React, { useState, useCallback, useMemo } from 'react';
import { ComposedChart, Line, Scatter, XAxis, YAxis, CartesianGrid, ReferenceLine, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github } from "lucide-react";

// 正規分布の累積分布関数のテーブル
const normalTable = {
  1.28: 0.90,
  1.44: 0.925,
  1.645: 0.95,
  1.96: 0.975,
  2.326: 0.99,
  2.576: 0.995,
  2.807: 0.9975,
  3.291: 0.999
};

// zスコアを取得する関数
const getZScore = (confidenceLevel: number): number => {
  const alpha = 1 - (confidenceLevel / 100);
  const probability = 1 - alpha/2;
  
  const entries = Object.entries(normalTable);
  const closest = entries.reduce((prev, curr) => {
    return Math.abs(curr[1] - probability) < Math.abs(prev[1] - probability) ? curr : prev;
  });
  
  return parseFloat(closest[0]);
};

const ConfidenceIntervalSimulator = () => {
  const [sampleSize, setSampleSize] = useState(30);
  const [confidenceLevel, setConfidenceLevel] = useState(95);
  const [numTrials, setNumTrials] = useState(20);
  const [intervals, setIntervals] = useState<Array<any>>([]);
  const [population, setPopulation] = useState<number[]>([]);
  const [populationMean, setPopulationMean] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");

  // 母集団を生成する関数
  const generatePopulation = useCallback(() => {
    const size = 10000;
    const mean = 3.5;
    const stdDev = 1.0;
    
    const newPopulation = Array.from({ length: size }, () => {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      return mean + z * stdDev;
    });
    
    setPopulation(newPopulation);
    setPopulationMean(mean);
  }, []);

  // 信頼区間を計算する関数
  const calculateConfidenceIntervals = useCallback(() => {
    setIsCalculating(true);
    setError("");

    try {
      if (population.length === 0) {
        generatePopulation();
      }

      const zScore = getZScore(confidenceLevel);

      const newIntervals = Array.from({ length: numTrials }, (_, i) => {
        // ランダムにサンプルを抽出
        const sample = Array.from({ length: sampleSize }, () => 
          population[Math.floor(Math.random() * population.length)]);
        
        // 標本平均と標準誤差を計算
        const sampleMean = sample.reduce((a, b) => a + b) / sampleSize;
        const sampleStdDev = Math.sqrt(
          sample.reduce((a, b) => a + Math.pow(b - sampleMean, 2), 0) / (sampleSize - 1)
        );
        const standardError = sampleStdDev / Math.sqrt(sampleSize);
        
        // 信頼区間を計算
        const margin = zScore * standardError;
        
        return {
          id: i + 1,
          x: i,
          lower: sampleMean - margin,
          upper: sampleMean + margin,
          mean: sampleMean
        };
      });

      setIntervals(newIntervals);
    } catch (err) {
      setError("計算中にエラーが発生しました。パラメータを確認してください。");
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  }, [population, sampleSize, confidenceLevel, numTrials, generatePopulation]);

  // データを整形
  const { intervalData, meanData, containsTrue } = useMemo(() => {
    const intervalData = [];
    const meanData = [];
    let containsTrue = 0;
    
    intervals.forEach(interval => {
      intervalData.push({
        id: interval.id,
        x: interval.id,
        y1: interval.lower,
        y2: interval.upper
      });
      
      meanData.push({
        id: interval.id,
        x: interval.id,
        mean: interval.mean
      });
      
      if (interval.lower <= populationMean && populationMean <= interval.upper) {
        containsTrue++;
      }
    });

    return { intervalData, meanData, containsTrue };
  }, [intervals, populationMean]);

  return (
    <Card className="w-full max-w-4xl mx-auto my-8">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">信頼区間シミュレータ</h2>
            <a
              href="https://github.com/yourusername/confidence-interval-simulator"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
          </div>

          <div className="space-y-2">
            <Label>標本の大きさ: {sampleSize}</Label>
            <Slider
              value={[sampleSize]}
              onValueChange={(value) => setSampleSize(value[0])}
              min={10}
              max={100}
              step={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label>信頼水準: {confidenceLevel}%</Label>
            <Slider
              value={[confidenceLevel]}
              onValueChange={(value) => setConfidenceLevel(value[0])}
              min={80}
              max={99}
              step={1}
            />
          </div>
          
          <div className="space-y-2">
            <Label>試行回数: {numTrials}</Label>
            <Slider
              value={[numTrials]}
              onValueChange={(value) => setNumTrials(value[0])}
              min={1}
              max={100}
              step={1}
            />
          </div>

          <Button 
            onClick={calculateConfidenceIntervals}
            className="w-full"
            disabled={isCalculating}
          >
            {isCalculating ? "計算中..." : "シミュレーション実行"}
          </Button>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {intervals.length > 0 && (
            <div className="space-y-4">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    margin={{ top: 20, right: 20, bottom: 20, left: 40 }}
                  >
                    <CartesianGrid />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      domain={[0, numTrials + 1]}
                      ticks={Array.from(
                        { length: Math.min(11, numTrials) },
                        (_, i) => Math.floor(i * (numTrials - 1) / Math.min(10, numTrials - 1))
                      )}
                    />
                    <YAxis 
                      type="number"
                      domain={[2.5, 4.5]}
                      ticks={[2.5, 3.0, 3.5, 4.0, 4.5]}
                    />
                    <ReferenceLine 
                      y={populationMean} 
                      stroke="red" 
                      strokeDasharray="3 3"
                    />
                    {intervalData.map((interval) => (
                      <Line
                        key={interval.id}
                        data={[
                          { x: interval.x, y: interval.y1 },
                          { x: interval.x, y: interval.y2 }
                        ]}
                        dataKey="y"
                        stroke="#8884d8"
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                    <Scatter
                      data={meanData}
                      dataKey="mean"
                      fill="#ff7300"
                      shape="diamond"
                      size={60}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>真の母平均を含む区間の割合: {((containsTrue / numTrials) * 100).toFixed(1)}%（{containsTrue} / {numTrials}）</p>
                <p>（赤の点線は真の母平均、オレンジのマークは標本平均）</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfidenceIntervalSimulator;
