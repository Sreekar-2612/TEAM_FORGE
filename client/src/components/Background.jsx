import Cubes from './Cubes'

function Background() {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      width: '100vw', 
      height: '100vh', 
      zIndex: -1,
      overflow: 'hidden',
      pointerEvents: 'auto'
    }}>
      <Cubes 
        gridSize={11}
        maxAngle={70}
        radius={4}
        borderStyle="3px dashed #5227FF"
        faceColor="#1a1a2e"
        rippleColor="#ff6b6b"
        rippleSpeed={1.5}
        autoAnimate={true}
        rippleOnClick={true}
      />
    </div>
  )
}

export default Background

