
const height = 15;
const wall = 2;

function main() {

  const outer = union(
    enclosure(wall).translate([-36, 0]),
    enclosure(wall).translate([-12, 0]),
    enclosure(wall).translate([12, 0]),
    enclosure(wall).translate([36, 0])
  )

  const inner = union(
    enclosure().translate([-36, 0]),
    enclosure().translate([-12, 0]),
    enclosure().translate([12, 0]),
    enclosure().translate([36, 0])
  )

  return outer.subtract(inner)
}


function enclosure(_s) {
  const wall = _s || 0

  const r = wall + 12;

  return union([
    cylinder({ r: r, h: height + wall }),
    cylinder({ r: 3, h: height * 2 }),
    cube({ size: [r * 2, 25 + wall, height + wall] })
      .translate([-r, 0]),

    // cube({ size: [20, 12, 22] })
    //   .translate([-10, -6])
    //   .intersect(
    //     cylinder({ r: 10, h: 40 })
    //   ),

    // notch (only on inner)
    wall === 0 ?
      cube({ size: [5, 2, height + 1] })
        .translate([5, -1]) : []
    // .intersect(
    //   cylinder({ r: 10, h: 40 })
    // ),

    // cylinder({ r: 10, h: 20 })
    //   .translate([0, 0, 30])

  ])
}