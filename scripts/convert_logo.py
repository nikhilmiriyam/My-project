from pathlib import Path
import cairosvg

def main():
    logo_svg = Path('client/logo.svg')
    logo_pdf = Path('client/logo.pdf')
    if not logo_svg.exists():
        print('logo.svg not found at', logo_svg.resolve())
        return
    cairosvg.svg2pdf(url=str(logo_svg), write_to=str(logo_pdf))
    print('Wrote', logo_pdf)

if __name__ == '__main__':
    main()
