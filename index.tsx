// TODO:
// Select test case to replay.
// 5. paintCorner(color)
// 6. Walls
// 7. random(), random(p) 
//
// etc: beepersInBag(), noBeepersInBag()

import React from 'react'
import { createRoot } from 'react-dom/client'
import KarelComponent from './KarelComponent'

const container = document.getElementById('root');

if (!container) {
  throw new Error('No container element found');
}

const root = createRoot(container);
root.render(<KarelComponent />);
