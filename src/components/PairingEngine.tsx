import React, { useState } from 'react'
import { usePairings, type Pairing } from '@/lib/hooks/usePairings'
import { useRounds } from '@/lib/hooks/useRounds'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const PairingEngine: React.FC = () => {
  const [pairingAlgorithm, setPairingAlgorithm] =
    useState<'swiss' | 'power' | 'random'>('swiss')
  const [roomsInput, setRoomsInput] = useState('')
  const [judgesInput, setJudgesInput] = useState('')
  const { pairings, currentRound, generatePairings } = usePairings()
  const { rounds } = useRounds()

  const handleGenerate = async () => {
    const rooms = roomsInput
      .split(',')
      .map(r => r.trim())
      .filter(Boolean)
    const judges = judgesInput
      .split(',')
      .map(j => j.trim())
      .filter(Boolean)
    await generatePairings({
      round: currentRound + 1,
      rooms,
      judges,
    })
  }

  return (
    <Card className="space-y-4">
      <CardHeader>
        <CardTitle>Pairing Engine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-semibold">
            Round {currentRound + 1} / {rounds.length}
          </span>
          <select
            value={pairingAlgorithm}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setPairingAlgorithm(
                e.target.value as 'swiss' | 'power' | 'random',
              )
            }
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="swiss">Swiss</option>
            <option value="power">Power</option>
            <option value="random">Random</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Rooms (comma separated)"
            value={roomsInput}
            onChange={e => setRoomsInput(e.target.value)}
          />
          <Input
            placeholder="Judges (comma separated)"
            value={judgesInput}
            onChange={e => setJudgesInput(e.target.value)}
          />
        </div>
        <Button onClick={handleGenerate}>Generate Pairings</Button>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Room</TableHead>
              <TableHead>Proposition</TableHead>
              <TableHead>Opposition</TableHead>
              <TableHead>Judge</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pairings
              .filter(p => p.round === currentRound + 1)
              .map((p: Pairing) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono">{p.room}</TableCell>
                  <TableCell>{p.proposition}</TableCell>
                  <TableCell>{p.opposition}</TableCell>
                  <TableCell>{p.judge}</TableCell>
                  <TableCell>{p.status}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
};

export default PairingEngine;
